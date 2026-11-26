// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MockTHB — demo settlement token ("Mock THB", 18 decimals)
/// @notice Demo-only token for BNB Hack Bangkok; the UI tags it visibly as a demo token.
///  Production target is a BOT-licensed THB stablecoin (Mar-2027 framework, ADR-0001
///  context / docs/research/thb-stablecoin-landscape.md). Standard approve/transferFrom
///  surface so the VenueStake bond and split contracts survive an issuer swap later.
contract MockTHB {
    // ---------- errors ----------
    error NotAdmin();
    error ZeroAddress();
    error InsufficientBalance();
    error InsufficientAllowance();

    // ---------- events ----------
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ---------- state ----------
    string public constant name = "Mock THB";
    string public constant symbol = "mTHB";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public admin;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(address admin_) {
        if (admin_ == address(0)) revert ZeroAddress();
        admin = admin_;
    }

    // ---------- demo faucet ----------
    function mint(address to, uint256 amount) external {
        if (msg.sender != admin) revert NotAdmin();
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    // ---------- ERC20 ----------
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < amount) revert InsufficientAllowance();
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (to == address(0)) revert ZeroAddress();
        if (balanceOf[from] < amount) revert InsufficientBalance();
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
