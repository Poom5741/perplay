// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MockTHB} from "../src/MockTHB.sol";
import {VenueStake} from "../src/VenueStake.sol";

/// @notice Seams under test (public interface; agreed in docs/spec/venue-stake-bond.md):
///  - stake(uint256): venue bonds the ERC20 token via allowance → stakeOf grows, StakeAdded emitted
///  - slash(address,uint256,string): ADMIN-ONLY — bond moves to the treasury, stakeOf shrinks,
///    StakeSlashed carries the reason (evidence class string; review-step model, admin key tonight)
///  - release(): venue exits with the full remaining bond, StakeReleased emitted
///  - isMember(): stakeOf >= requiredStake — the gate poc/server.mjs checks before issuing a play QR
contract VenueStakeTest is Test {
    MockTHB thb;
    VenueStake stake_;

    address admin = makeAddr("admin");     // platform key tonight
    address treasury = makeAddr("treasury"); // protocol treasury (slash destination)
    address venue = makeAddr("venue");

    uint256 constant REQUIRED = 1_000e18;
    uint256 constant BOND = 1_200e18;

    function setUp() public {
        thb = new MockTHB(admin);
        // real flow: the platform key deploys AND administers
        vm.prank(admin);
        stake_ = new VenueStake(address(thb), treasury, REQUIRED);
        vm.prank(admin);
        thb.mint(venue, BOND);
    }

    // ---------- slice 2: stake-in ----------

    function test_StakeGrowsStakeOfAndEmits() public {
        vm.startPrank(venue);
        thb.approve(address(stake_), BOND);
        vm.expectEmit(true, false, false, true, address(stake_));
        emit VenueStake.StakeAdded(venue, BOND, BOND);
        stake_.stake(BOND);
        vm.stopPrank();
        assertEq(stake_.stakeOf(venue), BOND);
        assertEq(thb.balanceOf(address(stake_)), BOND); // escrowed, not treasury
        assertEq(thb.balanceOf(treasury), 0);
    }

    function test_StakeAccumulates() public {
        vm.startPrank(venue);
        thb.approve(address(stake_), BOND);
        stake_.stake(1_000e18);
        stake_.stake(200e18);
        vm.stopPrank();
        assertEq(stake_.stakeOf(venue), BOND);
    }

    function test_MemberOnlyAtOrAboveRequired() public {
        vm.startPrank(venue);
        thb.approve(address(stake_), BOND);
        stake_.stake(REQUIRED - 1);
        assertFalse(stake_.isMember(venue));
        stake_.stake(1);
        assertTrue(stake_.isMember(venue));
        vm.stopPrank();
    }

    function test_NonMemberDefaultsToFalse() public view {
        assertFalse(stake_.isMember(venue));
    }

    function test_StakeRevertsOnInsufficientAllowance() public {
        vm.prank(venue);
        vm.expectRevert();
        stake_.stake(1); // no approval given
    }

    function test_StakeRevertsOnInsufficientBalance() public {
        address broke = makeAddr("broke");
        vm.prank(broke);
        thb.approve(address(stake_), 1e18); // approves, but holds no mTHB
        vm.prank(broke);
        vm.expectRevert();
        stake_.stake(1e18);
    }

    function test_ConfigIsPublic() public view {
        assertEq(address(stake_.token()), address(thb));
        assertEq(stake_.treasury(), treasury);
        assertEq(stake_.requiredStake(), REQUIRED);
    }

    // ---------- slice 3: slash (admin) + release (venue exit) ----------

    function _staked() internal {
        vm.startPrank(venue);
        thb.approve(address(stake_), BOND);
        stake_.stake(BOND);
        vm.stopPrank();
    }

    function test_SlashMovesBondToTreasuryAndEmitsReason() public {
        _staked();
        vm.prank(admin);
        vm.expectEmit(true, true, false, true, address(stake_));
        emit VenueStake.StakeSlashed(venue, treasury, 200e18, "fake-play report R-42", 1_000e18);
        stake_.slash(venue, 200e18, "fake-play report R-42");
        assertEq(stake_.stakeOf(venue), 1_000e18);
        assertEq(thb.balanceOf(treasury), 200e18);      // slash destination = treasury
        assertEq(thb.balanceOf(address(stake_)), 1_000e18);
        assertTrue(stake_.isMember(venue));              // 1000 >= 1000 — slashed to the wire
    }

    function test_SlashBelowRequiredDropsMembership() public {
        _staked();
        vm.prank(admin);
        stake_.slash(venue, 250e18, "repeat fake-play");
        assertFalse(stake_.isMember(venue));             // 950 < 1000 — gate closes
    }

    function test_SlashRevertsForNonAdmin() public {
        _staked();
        vm.prank(venue);
        vm.expectRevert(VenueStake.NotAdmin.selector);
        stake_.slash(venue, 1, "self-serve slash");      // venue cannot slash itself
    }

    function test_SlashRevertsAboveStake() public {
        _staked();
        vm.prank(admin);
        vm.expectRevert(VenueStake.InsufficientStake.selector);
        stake_.slash(venue, BOND + 1, "over-slash attempt");
    }

    function test_SlashRevertsOnZeroAmount() public {
        _staked();
        vm.prank(admin);
        vm.expectRevert(VenueStake.ZeroAmount.selector);
        stake_.slash(venue, 0, "no-op");
    }

    function test_ReleaseRefundsFullRemainingAndEmits() public {
        _staked();
        vm.prank(venue);
        vm.expectEmit(true, false, false, true, address(stake_));
        emit VenueStake.StakeReleased(venue, BOND);
        stake_.release();
        assertEq(stake_.stakeOf(venue), 0);
        assertEq(thb.balanceOf(venue), BOND);            // full refund
        assertEq(thb.balanceOf(address(stake_)), 0);     // escrow drained
        assertFalse(stake_.isMember(venue));
    }

    function test_ReleaseAfterPartialSlashRefundsRemainder() public {
        _staked();
        vm.prank(admin);
        stake_.slash(venue, 200e18, "fake-play report R-42");
        vm.prank(venue);
        stake_.release();
        assertEq(thb.balanceOf(venue), 1_000e18);        // refund = post-slash remainder only
        assertEq(thb.balanceOf(treasury), 200e18);       // slashed part stays with treasury
    }

    function test_ReleaseRevertsWhenNothingStaked() public {
        vm.prank(venue);
        vm.expectRevert(VenueStake.NothingStaked.selector);
        stake_.release();
    }
}
