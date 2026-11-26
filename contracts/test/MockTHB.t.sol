// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MockTHB} from "../src/MockTHB.sol";

/// @notice Seams under test (public interface; agreed in the token-economy grilling, issue #33):
///  - admin mint: the platform key mints demo baht to venue/fan wallets (demo faucet)
///  - ERC20 surface: approve/transferFrom — VenueStake bonds and the demo payment path rely on it
///  - identity: name "Mock THB", symbol "mTHB", 18 decimals — UI shows a visible "demo token" tag
contract MockTHBTest is Test {
    MockTHB thb;
    address admin = makeAddr("admin");
    address venue = makeAddr("venue");
    address fan = makeAddr("fan");

    function setUp() public {
        thb = new MockTHB(admin);
    }

    function test_IdentityMetadata() public view {
        assertEq(thb.name(), "Mock THB");
        assertEq(thb.symbol(), "mTHB");
        assertEq(thb.decimals(), 18);
    }

    function test_AdminMints(address to, uint256 amount) public {
        vm.assume(to != address(0));
        amount = bound(amount, 1, 1_000_000e18);
        vm.prank(admin);
        thb.mint(to, amount);
        assertEq(thb.balanceOf(to), amount);
        assertEq(thb.totalSupply(), amount);
    }

    function test_NonAdminCannotMint() public {
        vm.prank(fan);
        vm.expectRevert(MockTHB.NotAdmin.selector);
        thb.mint(fan, 1e18);
    }

    function test_TransferMovesBalance() public {
        vm.prank(admin);
        thb.mint(venue, 10_000e18);
        vm.prank(venue);
        assertTrue(thb.transfer(fan, 25e18));
        assertEq(thb.balanceOf(fan), 25e18);
        assertEq(thb.balanceOf(venue), 9_975e18);
    }

    function test_ApproveThenTransferFromSpendsAllowance() public {
        vm.prank(admin);
        thb.mint(venue, 1_000e18);
        vm.prank(venue);
        thb.approve(admin, 400e18);
        vm.prank(admin);
        assertTrue(thb.transferFrom(venue, fan, 400e18));
        assertEq(thb.balanceOf(fan), 400e18);
        assertEq(thb.balanceOf(venue), 600e18);
        assertEq(thb.allowance(venue, admin), 0); // fully spent
    }

    function test_TransferRevertsOnInsufficientBalance() public {
        vm.prank(fan);
        vm.expectRevert();
        thb.transfer(venue, 1);
    }

    function test_TransferFromRevertsOnInsufficientAllowance() public {
        vm.prank(admin);
        thb.mint(venue, 1e18);
        vm.prank(admin);
        vm.expectRevert();
        thb.transferFrom(venue, fan, 1);
    }
}
