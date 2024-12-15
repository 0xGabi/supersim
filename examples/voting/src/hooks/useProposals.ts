import { useState, useEffect, useCallback } from "react";
import { useConfig, useWatchContractEvent, useContractRead } from "wagmi";
import { getPublicClient } from "wagmi/actions";

import { abi, address } from "../constants/voting";

export interface ChainVotes {
    votesFor: number;
    votesAgainst: number;
}

export interface Proposal {
    id: number;
    description: string;
    startTime: number;
    endTime: number;
    totalVotesFor: number;
    totalVotesAgainst: number;
    chainVotes: Record<number, ChainVotes>;
    hasVoted: boolean;
    userVoteDirection?: boolean;
    status: ProposalStatus;
}

export enum ProposalStatus {
    Active = "Active",
    Passed = "Passed",
    Failed = "Failed",
    Pending = "Pending"
}

const proposalCreatedEvent = {
    name: 'ProposalCreated',
    type: 'event',
    inputs: [
        { indexed: true, name: 'proposalId', type: 'uint256' },
        { name: 'description', type: 'string' },
        { name: 'startTime', type: 'uint256' },
        { name: 'endTime', type: 'uint256' }
    ],
}

const voteCastedEvent = {
    name: 'VoteCasted',
    type: 'event',
    inputs: [
        { name: 'proposalId', type: 'uint256' },
        { name: 'voter', type: 'address' },
        { name: 'support', type: 'bool' }
    ],
}

const voteSentEvent = {
    name: 'VoteSent',
    type: 'event',
    inputs: [
        { name: 'sourceChainId', type: 'uint256' },
        { name: 'vote', type: 'tuple', components: [
            { name: 'proposalId', type: 'uint256' },
            { name: 'voter', type: 'address' },
            { name: 'support', type: 'bool' }
        ]}
    ],
}

export const useProposals = (account?: string) => {
    const [proposals, setProposals] = useState<Record<number, Proposal>>({});
    const [syncing, setSyncing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const config = useConfig();

    const addOrUpdateProposal = (
        proposalId: number,
        description: string,
        startTime: number,
        endTime: number,
        existingProposal?: Partial<Proposal>
    ) => {
        setProposals(prev => ({
            ...prev,
            [proposalId]: {
                id: proposalId,
                description,
                startTime,
                endTime,
                totalVotesFor: existingProposal?.totalVotesFor || 0,
                totalVotesAgainst: existingProposal?.totalVotesAgainst || 0,
                chainVotes: existingProposal?.chainVotes || {},
                hasVoted: existingProposal?.hasVoted || false,
                userVoteDirection: existingProposal?.userVoteDirection,
                status: getProposalStatus(startTime, endTime, 
                    existingProposal?.totalVotesFor || 0, 
                    existingProposal?.totalVotesAgainst || 0)
            }
        }));
    };

    const getProposalStatus = (
        startTime: number,
        endTime: number,
        votesFor: number,
        votesAgainst: number
    ): ProposalStatus => {
        const now = Math.floor(Date.now() / 1000);
        if (now < startTime) return ProposalStatus.Pending;
        if (now <= endTime) return ProposalStatus.Active;
        return votesFor > votesAgainst ? ProposalStatus.Passed : ProposalStatus.Failed;
    };

    // Add a function to update proposal status based on current time
    const updateProposalStatuses = useCallback(() => {
        setProposals(prev => {
            const updated = { ...prev };
            const now = Math.floor(Date.now() / 1000);
            
            Object.values(updated).forEach(proposal => {
                proposal.status = getProposalStatus(
                    proposal.startTime,
                    proposal.endTime,
                    proposal.totalVotesFor,
                    proposal.totalVotesAgainst,
                    now
                );
            });
            
            return updated;
        });
    }, []);

    // Update statuses periodically
    useEffect(() => {
        const interval = setInterval(updateProposalStatuses, 1000);
        return () => clearInterval(interval);
    }, [updateProposalStatuses]);

    // Watch for new proposals
    useWatchContractEvent({
        address,
        abi,
        eventName: 'ProposalCreated',
        onLogs(logs) {
            for (const log of logs) {
                const proposalId = Number(log.args.proposalId);
                const description = log.args.description as string;
                const startTime = Number(log.args.startTime);
                const endTime = Number(log.args.endTime);
                
                // Add new proposal immediately
                addOrUpdateProposal(proposalId, description, startTime, endTime);
            }
        },
    });

    // Watch for new votes
    useWatchContractEvent({
        address,
        abi,
        eventName: 'VoteCasted',
        onLogs(logs) {
            for (const log of logs) {
                const proposalId = Number(log.args.proposalId);
                const voter = log.args.voter as string;
                const support = log.args.support as boolean;

                setProposals(prev => {
                    const proposal = prev[proposalId];
                    if (!proposal) return prev;

                    const updatedProposal = {
                        ...proposal,
                        totalVotesFor: support ? proposal.totalVotesFor + 1 : proposal.totalVotesFor,
                        totalVotesAgainst: support ? proposal.totalVotesAgainst : proposal.totalVotesAgainst + 1,
                        hasVoted: account && voter.toLowerCase() === account.toLowerCase() ? true : proposal.hasVoted,
                        userVoteDirection: account && voter.toLowerCase() === account.toLowerCase() ? support : proposal.userVoteDirection,
                        status: getProposalStatus(
                            proposal.startTime,
                            proposal.endTime,
                            support ? proposal.totalVotesFor + 1 : proposal.totalVotesFor,
                            support ? proposal.totalVotesAgainst : proposal.totalVotesAgainst + 1
                        )
                    };

                    return {
                        ...prev,
                        [proposalId]: updatedProposal
                    };
                });
            }
        },
    });

    // Initial sync
    useEffect(() => {
        const fetchPastEvents = async () => {
            const proposalsInit: Record<number, Proposal> = {};

            // Fetch all proposal creation events
            for (const chain of config.chains) {
                const publicClient = getPublicClient(config, { chainId: chain.id });
                if (!publicClient) continue;

                const logs = await publicClient.getLogs({
                    address,
                    event: proposalCreatedEvent,
                    fromBlock: 'earliest',
                    toBlock: 'latest'
                });

                for (const log of logs) {
                    const proposalId = Number(log.args.proposalId);
                    const description = log.args.description as string;
                    const startTime = Number(log.args.startTime);
                    const endTime = Number(log.args.endTime);

                    if (!proposalsInit[proposalId]) {
                        proposalsInit[proposalId] = {
                            id: proposalId,
                            description,
                            startTime,
                            endTime,
                            totalVotesFor: 0,
                            totalVotesAgainst: 0,
                            chainVotes: {},
                            hasVoted: false,
                            userVoteDirection: undefined,
                            status: getProposalStatus(startTime, endTime, 0, 0)
                        };
                    }
                }
            }

            // Fetch all vote events
            for (const chain of config.chains) {
                const publicClient = getPublicClient(config, { chainId: chain.id });
                if (!publicClient) continue;

                const logs = await publicClient.getLogs({
                    address,
                    event: voteCastedEvent,
                    fromBlock: 'earliest',
                    toBlock: 'latest'
                });

                for (const log of logs) {
                    const proposalId = Number(log.args.proposalId);
                    const voter = log.args.voter as string;
                    const support = log.args.support as boolean;
                    const proposal = proposalsInit[proposalId];

                    if (proposal) {
                        if (support) {
                            proposal.totalVotesFor++;
                            proposal.chainVotes[chain.id] = {
                                votesFor: (proposal.chainVotes[chain.id]?.votesFor || 0) + 1,
                                votesAgainst: proposal.chainVotes[chain.id]?.votesAgainst || 0
                            };
                        } else {
                            proposal.totalVotesAgainst++;
                            proposal.chainVotes[chain.id] = {
                                votesFor: proposal.chainVotes[chain.id]?.votesFor || 0,
                                votesAgainst: (proposal.chainVotes[chain.id]?.votesAgainst || 0) + 1
                            };
                        }

                        if (account && voter.toLowerCase() === account.toLowerCase()) {
                            proposal.hasVoted = true;
                        }

                        proposal.status = getProposalStatus(
                            proposal.startTime,
                            proposal.endTime,
                            proposal.totalVotesFor,
                            proposal.totalVotesAgainst
                        );
                    }
                }
            }

            setProposals(proposalsInit);
            setSyncing(false);
        };

        fetchPastEvents();
    }, [config.chains, account]);

    // Add refresh functionality
    const refreshProposals = async () => {
        try {
            setSyncing(true);
            await fetchPastEvents();
        } catch (err) {
            setError('Failed to refresh proposals');
            console.error('Error refreshing proposals:', err);
        } finally {
            setSyncing(false);
        }
    };

    // Add cleanup for event listeners
    useEffect(() => {
        return () => {
            // Cleanup subscriptions if needed
        };
    }, []);

    return { 
        proposals, 
        syncing,
        error,
        refreshProposals,
        addOrUpdateProposal 
    };
};
