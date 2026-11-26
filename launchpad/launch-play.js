/**
 * PerPlay × OpenFour — launch $PLAY ("PerPlay Protocol") on BSC Testnet.
 *
 * Uses a developer-owned OpenFour fork (see fork-deployment.json — Registry/Core/
 * Tools deployed by `npm run fork` from github.com/four-meme-community/openfour-docs,
 * developer/fork-deploy) with the standard bondingV1 preset: WBNB-quoted bonding curve,
 * PancakeSwap-style migration on graduation.
 *
 * Flow (mirrors fork-deploy/create-test-preset.js):
 *   1. build createArgs from the preset encode schemas (Tools.getPresetEncodeSchemas)
 *   2. sign "createOpenFourToken" digest with the fork's SIGNER key
 *   3. Core.createToken(createArgs, signature)
 *   4. optional buys: platform seeds the curve, fan wallet picks up $PLAY (perk seed)
 *
 * Env: DEPLOYER_PRIVATE_KEY (fork signer = platform), FAN_PRIVATE_KEY (optional),
 *      RAISE_AMOUNT (default 0.1), PLATFORM_BUY_BNB (default 0.05), FAN_BUY_BNB (default 0.005)
 * Output: play-token.json — token, vault, creator, tx hashes.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const RPC = process.env.BSC_RPC_URL || "https://bsc-testnet.publicnode.com";
const FORK_JSON = path.join(__dirname, "fork-deployment.json");

const PARAM_TUPLE =
  "tuple(string name,string abiType,uint8 decimals,bool optional,string title,string defaultValue,string hint,string minValue,string maxValue)";
const MODULE_SCHEMA = `tuple(string kind,uint8 version,${PARAM_TUPLE}[] params)`;
const coder = ethers.AbiCoder.defaultAbiCoder();

const CORE_ABI = [
  "function createToken(bytes createArgs, bytes signature) payable returns (address)",
  "function buy(address token,uint256 amount,uint256 maxQuotePayAmount,uint256 options,bytes proof) payable",
  "function buyByBudget(address token,uint256 maxPayAmount,uint256 minAmountOut,uint256 options,bytes proof) payable",
  "function tokens(address) view returns (uint32 version,address creator,uint256 presetId,address token,string name,string symbol,uint256 maxSupply,uint256 saleAmount,uint256 raiseAmount,address quoteAsset,address vault,address curveModule,address tradeModule,address migrateModule,address tokenModule,address customData,uint256 createBlock,bool exists,bool paused,bool antiSniperEnabled)",
  "event TokenCreated(uint256 requestId, uint256 indexed presetId, address indexed creator, address indexed token, string name, string symbol, uint256 maxSupply, uint256 saleAmount, uint256 raiseAmount, uint256 initialPrice, address quoteAsset, address vault, address curveModule, address tradeModule, address migrateModule, address customData, address tokenModule, string tokenMetaUri, uint256 flags, bytes encodedTags)",
];

const TOOLS_ABI = [
  `function getPresetEncodeSchemas(uint256) view returns (${MODULE_SCHEMA},${MODULE_SCHEMA},${MODULE_SCHEMA},${MODULE_SCHEMA},${MODULE_SCHEMA},${MODULE_SCHEMA})`,
  "function estimateBuyByBudget(address token,address trader,uint256 maxQuotePayAmount,uint256 options,bytes proof) returns (tuple(uint256 curveQuote, uint256 totalFee, uint256 userPays, uint256 userReceives, uint256 tokenAmount, uint256 executionPrice))",
];

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function deposit() payable",
  "function approve(address,uint256) returns (bool)",
];

function zeroValue(abiType) {
  if (abiType.endsWith("[]")) return [];
  if (abiType === "address") return ethers.ZeroAddress;
  if (abiType === "bool") return false;
  if (abiType === "bytes32") return ethers.ZeroHash;
  if (abiType === "bytes") return "0x";
  if (abiType === "string") return "";
  return 0n;
}

function resolveParam(desc, form) {
  let raw = form[desc.name];
  if (raw == null || String(raw).trim() === "") {
    if (desc.defaultValue != null && String(desc.defaultValue).trim() !== "") raw = desc.defaultValue;
    else if (desc.optional) return zeroValue(desc.abiType);
    else throw new Error(`missing ${desc.name}`);
  }
  const str = String(raw).trim();
  switch (desc.abiType) {
    case "bool": return str === "true" || str === "1";
    case "address": return str || ethers.ZeroAddress;
    case "string": return str;
    case "bytes32": return str || ethers.ZeroHash;
    case "bytes": return str || "0x";
    default: return Number(desc.decimals) > 0 ? ethers.parseUnits(str, desc.decimals) : BigInt(str);
  }
}

function encodeModuleParams(schema, form) {
  if (!schema?.params?.length) return "0x";
  return coder.encode(
    [`(${schema.params.map((p) => p.abiType).join(",")})`],
    [schema.params.map((p) => resolveParam(p, form))],
  );
}

function encodeCreateArgs({ requestId, presetId, validTimestamp, quoteAsset, form, schemas }) {
  return coder.encode(
    ["tuple(uint256 requestId,uint256 presetId,uint256 validTimestamp,uint256 createFee,uint256 presaleQuote,bool antiSniperEnabled,address partner,tuple(string name,string symbol,string tokenUri,uint256 maxSupply,uint256 saleAmount,uint256 raiseAmount,address quoteAsset,bytes32 tokenSalt,bytes tokenParams,bytes vaultParams,bytes curveParams,bytes tradeParams,bytes migrateParams,bytes customDataParams) initParams)"],
    [[requestId, presetId, validTimestamp, 0n, 0n, false, ethers.ZeroAddress, [
      form.name, form.symbol, form.tokenUri || "",
      ethers.parseUnits(String(form.maxSupply), 18),
      ethers.parseUnits(String(form.saleAmount), 18),
      ethers.parseUnits(String(form.raiseAmount), 18),
      quoteAsset, ethers.ZeroHash,
      encodeModuleParams(schemas.token, form),
      encodeModuleParams(schemas.vault, form),
      encodeModuleParams(schemas.curve, form),
      encodeModuleParams(schemas.trade, form),
      encodeModuleParams(schemas.migrate, form),
      encodeModuleParams(schemas.customData, form),
    ]]],
  );
}

async function signCreate(signer, chainId, createArgs) {
  const caller = await signer.getAddress();
  const payload = ethers.solidityPacked(
    ["string", "uint256", "address", "bytes32"],
    ["createOpenFourToken", chainId, caller, ethers.keccak256(createArgs)],
  );
  const digest = ethers.keccak256(payload);
  const signature = await signer.signMessage(ethers.getBytes(digest));
  return { caller, signature };
}

const txOverrides = { gasPrice: 100_000_000n }; // BSC testnet: explicit legacy gas price

async function ensureWbnb(wallet, wbnb, coreAddr, budget) {
  const w = new ethers.Contract(wbnb, ERC20_ABI, wallet);
  const bal = await w.balanceOf(wallet.address);
  if (bal < budget) {
    const tx = await w.deposit({ ...txOverrides, value: budget - bal });
    console.log(`  wrap ${ethers.formatEther(budget - bal)} BNB → WBNB tx=${tx.hash}`);
    await tx.wait();
  }
  if ((await w.allowance(wallet.address, coreAddr)) < budget) {
    const tx = await w.approve(coreAddr, ethers.MaxUint256, txOverrides);
    console.log(`  approve WBNB→Core tx=${tx.hash}`);
    await tx.wait();
  }
}

async function main() {
  const fork = JSON.parse(fs.readFileSync(FORK_JSON, "utf8"));
  const provider = new ethers.JsonRpcProvider(RPC, { chainId: 97, name: "bsc-testnet" });
  const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const core = new ethers.Contract(fork.addresses.core, CORE_ABI, deployer);
  const tools = new ethers.Contract(fork.addresses.tools, TOOLS_ABI, provider);
  const presetId = BigInt(fork.presets.bondingV1);
  const wbnb = ethers.getAddress(fork.addresses.wbnb);
  const raiseAmount = process.env.RAISE_AMOUNT || "0.1";
  const form = {
    name: "PerPlay Protocol",
    symbol: "PLAY",
    tokenUri: "",
    maxSupply: "10000000000",
    saleAmount: "8000000000",
    raiseAmount,
  };

  let token = (process.env.PLAY_TOKEN || "").trim();
  let createRc = null;
  if (token) {
    console.log(`resume: using existing $PLAY ${token}`);
  } else {

  console.log(`fork registry ${fork.addresses.registry}`);
  console.log(`core ${fork.addresses.core} · preset bondingV1 (${presetId}) · raise ${raiseAmount} tBNB`);

  const [tokenSch, vaultSch, curveSch, tradeSch, migrateSch, customSch] = await tools.getPresetEncodeSchemas(presetId);
  const schemas = {
    token: { params: Array.from(tokenSch.params).map((p) => p) },
    vault: { params: Array.from(vaultSch.params).map((p) => p) },
    curve: { params: Array.from(curveSch.params).map((p) => p) },
    trade: { params: Array.from(tradeSch.params).map((p) => p) },
    migrate: { params: Array.from(migrateSch.params).map((p) => p) },
    customData: { params: Array.from(customSch.params).map((p) => p) },
  };

  const createArgs = encodeCreateArgs({
    requestId: BigInt(Date.now() + Math.floor(Math.random() * 1e6)),
    presetId,
    validTimestamp: BigInt(Math.floor(Date.now() / 1000) + 3600),
    quoteAsset: wbnb,
    form,
    schemas,
  });
  const { caller, signature } = await signCreate(deployer, 97, createArgs);
  console.log(`createToken signer/caller ${caller}`);

  const createTx = await core.createToken(createArgs, signature, txOverrides);
  createRc = await createTx.wait();
  console.log(`create tx=${createRc.hash}`);

  for (const log of createRc.logs) {
    try { const ev = core.interface.parseLog(log); if (ev?.name === "TokenCreated") { token = ev.args.token; } } catch { /* non-core log */ }
  }
  if (!token) throw new Error("TokenCreated event not found in create receipt");
  }
  const info = await core.tokens(token);
  const vault = info.vault;
  const creator = info.creator;
  console.log(`$PLAY ${token} · vault ${vault} · exists=${info.exists}`);

  const result = { network: "bsctestnet", chainId: 97, registry: fork.addresses.registry, core: fork.addresses.core, tools: fork.addresses.tools, preset: "bondingV1", token, vault, creator, createTx: createRc ? createRc.hash : null, name: form.name, symbol: form.symbol, raiseAmount, launchedAt: new Date().toISOString() };

  // --- buys: platform seeds the curve, fan picks up $PLAY for the coin-gated perk ---
  const platformBuy = ethers.parseEther(process.env.PLATFORM_BUY_BNB || "0.05");
  await ensureWbnb(deployer, wbnb, fork.addresses.core, platformBuy);
  const buyPlat = await core.buyByBudget(token, platformBuy, 0n, 0, "0x", { ...txOverrides, value: 0 });
  const buyPlatRc = await buyPlat.wait();
  console.log(`platform buy tx=${buyPlatRc.hash}`);
  result.platformBuyTx = buyPlatRc.hash;

  if (process.env.FAN_PRIVATE_KEY) {
    const fan = new ethers.Wallet(process.env.FAN_PRIVATE_KEY, provider);
    const coreFan = core.connect(fan); // send the fan buy FROM the fan wallet, not the deployer
    const fanBuy = ethers.parseEther(process.env.FAN_BUY_BNB || "0.005");
    await ensureWbnb(fan, wbnb, fork.addresses.core, fanBuy);
    const buyFan = await coreFan.buyByBudget(token, fanBuy, 0n, 0, "0x", { ...txOverrides, value: 0 });
    const buyFanRc = await buyFan.wait();
    console.log(`fan buy tx=${buyFanRc.hash}`);
    result.fanBuyTx = buyFanRc.hash;
    result.fanAddress = await fan.getAddress();
    result.fanBalance = (await new ethers.Contract(token, ERC20_ABI, provider).balanceOf(result.fanAddress)).toString();
  }

  fs.writeFileSync(path.join(__dirname, "play-token.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(`wrote play-token.json — $PLAY live at ${token}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
