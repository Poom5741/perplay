// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {MockTHB} from "../src/MockTHB.sol";
import {VenueStake} from "../src/VenueStake.sol";

/// @notice Deploy the demo token + venue bond escrow to BSC Testnet (chain 97, ADR-0001).
///  Broadcast from the PLATFORM key (deploys and administers). Treasury = platform address
///  tonight (demo); production: protocol treasury + multisig admin per the bond spec.
///  Env: REQUIRED_STAKE (default 1000 mTHB) · VENUE_ADDRESS · FAN_ADDRESS
contract Deploy is Script {
    function run() external {
        uint256 requiredStake = vm.envOr("REQUIRED_STAKE", uint256(1_000e18));
        address venue = vm.envAddress("VENUE_ADDRESS");
        address fan = vm.envAddress("FAN_ADDRESS");

        vm.startBroadcast();
        MockTHB thb = new MockTHB(msg.sender); // admin = platform key
        VenueStake vs = new VenueStake(address(thb), msg.sender, requiredStake);
        thb.mint(venue, 10_000e18); // venue bond pool
        thb.mint(fan, 1_000e18);    // fan play budget (~1000 plays at ≤1 mTHB)
        vm.stopBroadcast();

        string memory json = "deploy";
        vm.serializeAddress(json, "mockTHB", address(thb));
        vm.serializeAddress(json, "venueStake", address(vs));
        vm.serializeAddress(json, "admin", msg.sender);
        vm.serializeAddress(json, "treasury", msg.sender);
        vm.serializeAddress(json, "venue", venue);
        vm.serializeAddress(json, "fan", fan);
        vm.serializeUint(json, "requiredStake", requiredStake);
        string memory out = vm.serializeUint(json, "chainId", block.chainid);
        vm.writeJson(out, "deployments/bscTestnet.json");

        console2.log("MockTHB   ", address(thb));
        console2.log("VenueStake", address(vs));
        console2.log("admin/tre ", msg.sender);
        console2.log("required  ", requiredStake);
        console2.log("saved -> deployments/bscTestnet.json");
    }
}
