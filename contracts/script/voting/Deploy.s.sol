// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {CrossChainVoting} from "../../src/voting/CrossChainVoting.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 governanceChainId = 901;

        vm.broadcast();

        CrossChainVoting voting = new CrossChainVoting{salt: "votingapp"}(governanceChainId);
        console.log("Deployed at: ", address(voting));
    }
}
