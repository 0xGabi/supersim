// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {Predeploys} from "@contracts-bedrock/libraries/Predeploys.sol";
import {Identifier, ICrossL2Inbox} from "@contracts-bedrock/L2/interfaces/ICrossL2Inbox.sol";
import {IL2ToL2CrossDomainMessenger} from "@contracts-bedrock/L2/interfaces/IL2ToL2CrossDomainMessenger.sol";

/// @notice Thrown when a function is called by an address other than the L2ToL2CrossDomainMessenger.
error CallerNotL2ToL2CrossDomainMessenger();

/// @notice Thrown when the cross-domain sender is not this contract's address on another chain.
error InvalidCrossDomainSender();

/// @notice Thrown when the caller is not on the governance chain   
error NotGovernanceChain();

/// @notice Thrown when the destination chain is the same as the source chain
error InvalidDestination();

/// @notice Thrown when the proposal is not active
error ProposalNotActive();

/// @notice Thrown when the voter has already voted
error AlreadyVoted();

/// @notice Thrown when the voting period has not ended
error VotingPeriodNotEnded();

/// @notice Structure to hold proposal information
/// @dev Includes vote counts both per chain and total
struct Proposal {
    uint256 id;
    string description;
    uint256 startTime;
    uint256 endTime;
    uint256 totalVotesFor;
    uint256 totalVotesAgainst;
    mapping(uint256 => ChainVotes) chainVotes;
    mapping(address => bool) hasVoted;
}

/// @notice Structure to track votes from a specific chain
struct ChainVotes {
    uint256 votesFor;
    uint256 votesAgainst;
}

/// @notice Structure to hold vote information
struct Vote {
    uint256 proposalId;
    address voter;
    bool support;
}

/// @title CrossChainVoting
/// @notice A contract that enables voting across multiple chains with centralized tallying
/// @dev Votes are cast on any chain but tallied on a designated governance chain
contract CrossChainVoting {
    uint256 public governanceChainId;                 // The chain that is the governance chain
    uint256 public nextProposalId;

    mapping(uint256 => Proposal) public proposals;

    /// @notice Emitted when a new proposal is created
    event ProposalCreated(
        uint256 indexed proposalId,
        string description,
        uint256 startTime,
        uint256 endTime
    );

    /// @notice Emitted when a vote is sent cross-chain
    event VoteSent(
        uint256 sourceChainId,
        Vote vote
    );

    /// @notice Emitted when a vote is cast
    event VoteCasted(
        uint256 proposalId,
        address voter,
        bool support
    );

    /// @dev The L2 to L2 cross domain messenger predeploy to handle message passing
    IL2ToL2CrossDomainMessenger internal messenger =
        IL2ToL2CrossDomainMessenger(Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER);

    /// @notice Ensures function is only called on the governance chain
    modifier onlyGovernanceChain() {
        if (block.chainid != governanceChainId) revert NotGovernanceChain();
        _;
    }

    /// @dev Modifier to restrict a function to only be a cross-domain callback into this contract
    modifier onlyCrossDomainCallback() {
        if (msg.sender != address(messenger)) revert CallerNotL2ToL2CrossDomainMessenger();
        if (messenger.crossDomainMessageSender() != address(this)) revert InvalidCrossDomainSender();

        _;
    }

   /**
     * @notice Since CREATE2 includes initcode, the voting address is deterministic with the the starting chain.
     * @param _governanceChainId The chain that is the governance chain.
     */
    constructor(uint256 _governanceChainId) {
        governanceChainId = _governanceChainId;
    }

    /** 
     * @notice Creates a new proposal
     * @dev Only callable on the governance chain
     * @param _description The description of the proposal
     * @param _votingPeriod How long the voting period will last
     */
    function createProposal(
        string calldata _description,
        uint256 _votingPeriod
    ) external onlyGovernanceChain {
        uint256 proposalId = nextProposalId++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.description = _description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + _votingPeriod;
        
        emit ProposalCreated(
            proposalId,
            proposal.description,
            proposal.startTime,
            proposal.endTime
        );
    }


    /** 
     * @notice Casts a vote
     * @dev If called on a non-governance chain, sends the vote through L2CrossDomainMessenger.
     *      If called on the governance chain, casts the vote directly.
     * @param _proposalId The ID of the proposal to vote on      
     * @param _support True for voting in favor, false for voting against
     */
    function castVote(
        uint256 _proposalId,
        bool _support
    ) external {
        // If the caller is not on the governance chain, send the vote to the governance chain
        if (block.chainid != governanceChainId) {
            Vote memory newVote = Vote(_proposalId, msg.sender, _support);
            messenger.sendMessage(governanceChainId, address(this), abi.encodeCall(this.receiveVote, (newVote)));
            emit VoteSent(block.chainid, newVote);
        } else {
            _castVote(_proposalId, msg.sender, _support, block.chainid);
        }
    }

    /** 
     * @notice Receives a cross-chain vote on the governance chain
     * @dev Only callable through the L2CrossDomainMessenger
     * @param _vote The vote to receive
     */
    function receiveVote(
        Vote memory _vote
    ) external onlyGovernanceChain onlyCrossDomainCallback {
        uint256 sourceChainId = messenger.crossDomainMessageSource();
        _castVote(_vote.proposalId, _vote.voter, _vote.support, sourceChainId);
    }

    function _castVote(
        uint256 _proposalId,    
        address _voter,
        bool _support,
        uint256 _sourceChainId
    ) internal {
        Proposal storage proposal = proposals[_proposalId];
        
        // Verify proposal is active and voter hasn't voted
        if (block.timestamp < proposal.startTime || block.timestamp > proposal.endTime) 
            revert ProposalNotActive();
        if (proposal.hasVoted[_voter]) 
            revert AlreadyVoted();

        // Record the vote
        proposal.hasVoted[_voter] = true;
        
        if (_support) {
            proposal.totalVotesFor++;
            proposal.chainVotes[_sourceChainId].votesFor++;
        } else {
            proposal.totalVotesAgainst++;
            proposal.chainVotes[_sourceChainId].votesAgainst++;
        }

        emit VoteCasted(_proposalId, _voter, _support);
    }


    /** 
     * @notice Gets the details of a proposal
     * @param _proposalId The ID of the proposal to query
     * @return description The proposal description
     * @return startTime When voting begins
     * @return endTime When voting ends
     * @return totalVotesFor Total votes in favor
     * @return totalVotesAgainst Total votes against
     */
    function getProposal(uint256 _proposalId) external view returns (
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 totalVotesFor,
        uint256 totalVotesAgainst
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.totalVotesFor,
            proposal.totalVotesAgainst
        );
    }

    /** 
     * @notice Gets the vote counts for a specific chain
     * @param _proposalId The ID of the proposal
     * @param _chainId The chain ID to query votes for
     * @return votesFor Votes in favor on this chain
     * @return votesAgainst Votes against on this chain
     */
    function getChainVotes(uint256 _proposalId, uint256 _chainId) external view returns (
        uint256 votesFor,
        uint256 votesAgainst
    ) {
        ChainVotes storage chainVotes = proposals[_proposalId].chainVotes[_chainId];
        return (
            chainVotes.votesFor,
            chainVotes.votesAgainst
        );
    }

    /** 
     * @notice Checks if an address has voted on a proposal
     * @param _proposalId The ID of the proposal
     * @param _voter The address to check
     * @return Whether the address has voted
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
}
