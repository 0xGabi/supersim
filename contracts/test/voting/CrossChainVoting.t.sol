// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../../src/voting/CrossChainVoting.sol";

contract CrossChainVotingTest is Test {
    CrossChainVoting public voting;
    uint256 public constant GOVERNANCE_CHAIN_ID = 1;
    uint256 public constant OTHER_CHAIN_ID = 2;
    address public voter1 = address(0x1);
    address public voter2 = address(0x2);

    event ProposalCreated(
        uint256 indexed proposalId,
        string description,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCasted(
        uint256 proposalId,
        address voter,
        bool support
    );

    function setUp() public {
        // Set chain ID to governance chain
        vm.chainId(GOVERNANCE_CHAIN_ID);
        voting = new CrossChainVoting(GOVERNANCE_CHAIN_ID);
    }

    function testCreateProposal() public {
        string memory description = "Test Proposal";
        uint256 votingPeriod = 1 days;

        vm.expectEmit(true, false, false, true);
        emit ProposalCreated(0, description, block.timestamp, block.timestamp + votingPeriod);
        
        voting.createProposal(description, votingPeriod);

        (
            string memory returnedDescription,
            uint256 startTime,
            uint256 endTime,
            uint256 totalVotesFor,
            uint256 totalVotesAgainst
        ) = voting.getProposal(0);

        assertEq(returnedDescription, description);
        assertEq(startTime, block.timestamp);
        assertEq(endTime, block.timestamp + votingPeriod);
        assertEq(totalVotesFor, 0);
        assertEq(totalVotesAgainst, 0);
    }

    function testCreateProposalOnlyGovernanceChain() public {
        vm.chainId(OTHER_CHAIN_ID);
        
        vm.expectRevert(NotGovernanceChain.selector);
        voting.createProposal("Test Proposal", 1 days);
    }

    function testCastVoteOnGovernanceChain() public {
        // Create proposal
        voting.createProposal("Test Proposal", 1 days);
        uint256 proposalId = 0;

        // Cast vote
        vm.prank(voter1);
        vm.expectEmit(true, true, true, true);
        emit VoteCasted(proposalId, voter1, true);
        
        voting.castVote(proposalId, true);

        // Verify vote was counted
        (,,,uint256 votesFor, uint256 votesAgainst) = voting.getProposal(proposalId);
        assertEq(votesFor, 1);
        assertEq(votesAgainst, 0);
        assertTrue(voting.hasVoted(proposalId, voter1));
    }

    function testCannotVoteTwice() public {
        // Create proposal
        voting.createProposal("Test Proposal", 1 days);
        uint256 proposalId = 0;

        // First vote
        vm.prank(voter1);
        voting.castVote(proposalId, true);

        // Second vote should fail
        vm.prank(voter1);
        vm.expectRevert(AlreadyVoted.selector);
        voting.castVote(proposalId, true);
    }

    function testCannotVoteAfterEndTime() public {
        // Create proposal
        voting.createProposal("Test Proposal", 1 days);
        uint256 proposalId = 0;

        // Warp to after end time
        vm.warp(block.timestamp + 2 days);

        vm.prank(voter1);
        vm.expectRevert(ProposalNotActive.selector);
        voting.castVote(proposalId, true);
    }

    function testGetChainVotes() public {
        // Create proposal
        voting.createProposal("Test Proposal", 1 days);
        uint256 proposalId = 0;

        // Cast votes from different voters
        vm.prank(voter1);
        voting.castVote(proposalId, true);
        
        vm.prank(voter2);
        voting.castVote(proposalId, false);

        // Check chain-specific vote counts
        (uint256 votesFor, uint256 votesAgainst) = voting.getChainVotes(proposalId, GOVERNANCE_CHAIN_ID);
        assertEq(votesFor, 1);
        assertEq(votesAgainst, 1);
    }
}