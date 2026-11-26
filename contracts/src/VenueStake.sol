// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./IERC20.sol";

/// @title VenueStake — venue membership bond escrow (per docs/spec/venue-stake-bond.md)
/// @notice Venues stake the bond token to become members (skin-in-the-game against fake
///  plays). Funds leave escrow ONLY via slash() (admin, to the protocol treasury, with a
///  reason string for the review step) or release() (venue exit). Bond token tonight is
///  MockTHB; production bond is the protocol coin — swap is a constructor-argument change.
contract VenueStake {
    // ---------- errors ----------
    error NotAdmin();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientStake();
    error NothingStaked();

    // ---------- events ----------
    event StakeAdded(address indexed venue, uint256 amount, uint256 total);
    event StakeSlashed(address indexed venue, address indexed to, uint256 amount, string reason, uint256 remaining);
    event StakeReleased(address indexed venue, uint256 amount);

    // ---------- config ----------
    IERC20 public token;
    address public treasury;
    uint256 public requiredStake;
    address public admin;

    // ---------- state ----------
    mapping(address => uint256) public stakeOf;

    constructor(address token_, address treasury_, uint256 requiredStake_) {
        if (token_ == address(0) || treasury_ == address(0)) revert ZeroAddress();
        token = IERC20(token_);
        treasury = treasury_;
        requiredStake = requiredStake_;
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    /// @notice Membership gate — checked by poc/server.mjs before issuing a play QR.
    function isMember(address venue) external view returns (bool) {
        return stakeOf[venue] >= requiredStake;
    }

    /// @notice Venue bonds `amount` of the token (must have approved this escrow).
    function stake(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        token.transferFrom(msg.sender, address(this), amount);
        stakeOf[msg.sender] += amount;
        emit StakeAdded(msg.sender, amount, stakeOf[msg.sender]);
    }

    /// @notice ADMIN ONLY — punish a venue for evidenced bad behavior (fake plays).
    ///  Bond moves to the protocol treasury; the reason string names the evidence class
    ///  for the review step (fingerprint miss / setlist mismatch / customer report).
    ///  Demo trust model: admin key = platform; production: multisig + dispute window.
    function slash(address venue, uint256 amount, string calldata reason) external onlyAdmin {
        if (amount == 0) revert ZeroAmount();
        if (stakeOf[venue] < amount) revert InsufficientStake();
        stakeOf[venue] -= amount;
        token.transfer(treasury, amount);
        emit StakeSlashed(venue, treasury, amount, reason, stakeOf[venue]);
    }

    /// @notice Venue exits: the full remaining bond returns to the venue.
    function release() external {
        uint256 amount = stakeOf[msg.sender];
        if (amount == 0) revert NothingStaked();
        stakeOf[msg.sender] = 0;
        token.transfer(msg.sender, amount);
        emit StakeReleased(msg.sender, amount);
    }
}
