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

    const updateProposalVotes = useCallback(async (proposalId: number) => {
        try {
            let totalVotesFor = 0;
            let totalVotesAgainst = 0;
            const chainVotes: Record<number, ChainVotes> = {};
            let hasVoted = false;
            let userVoteDirection;

            // Fetch votes from all chains for this proposal
            for (const chain of config.chains) {
                const publicClient = getPublicClient(config, { chainId: chain.id });
                if (!publicClient) continue;

                const logs = await publicClient.getLogs({
                    address,
                    event: voteCastedEvent,
                    args: {
                        proposalId: BigInt(proposalId)
                    },
                    fromBlock: 'earliest',
                    toBlock: 'latest'
                });

                let chainVotesFor = 0;
                let chainVotesAgainst = 0;

                for (const log of logs) {
                    const voter = log.args.voter as string;
                    const support = log.args.support as boolean;

                    if (support) {
                        totalVotesFor++;
                        chainVotesFor++;
                    } else {
                        totalVotesAgainst++;
                        chainVotesAgainst++;
                    }

                    if (account && voter.toLowerCase() === account.toLowerCase()) {
                        hasVoted = true;
                        userVoteDirection = support;
                    }
                }

                chainVotes[chain.id] = {
                    votesFor: chainVotesFor,
                    votesAgainst: chainVotesAgainst
                };
            }

            setProposals(prev => {
                const proposal = prev[proposalId];
                if (!proposal) return prev;

                return {
                    ...prev,
                    [proposalId]: {
                        ...proposal,
                        totalVotesFor,
                        totalVotesAgainst,
                        chainVotes,
                        hasVoted,
                        userVoteDirection,
                        status: getProposalStatus(
                            proposal.startTime,
                            proposal.endTime,
                            totalVotesFor,
                            totalVotesAgainst
                        )
                    }
                };
            });
        } catch (error) {
            console.error(`Error updating proposal ${proposalId}:`, error);
        }
    }, [config.chains, account]);

    const fetchPastEvents = useCallback(async () => {
        try {
            setSyncing(true);
            const proposalsInit: Record<number, Proposal> = {};

            // Fetch all proposals first
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

            // Set initial proposals
            setProposals(proposalsInit);

            // Update votes for each proposal
            await Promise.all(
                Object.keys(proposalsInit).map(id => 
                    updateProposalVotes(Number(id))
                )
            );
        } catch (err) {
            setError('Failed to fetch proposals');
            console.error('Error fetching proposals:', err);
        } finally {
            setSyncing(false);
        }
    }, [config.chains, updateProposalVotes]);

    // Watch for new votes with immediate updates
    useWatchContractEvent({
        address,
        abi,
        eventName: 'VoteCasted',
        onLogs(logs) {
            for (const log of logs) {
                const proposalId = Number(log.args.proposalId);
                updateProposalVotes(proposalId);
            }
        },
    });

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
                
                // Add new proposal and fetch its votes
                setProposals(prev => ({
                    ...prev,
                    [proposalId]: {
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
                    }
                }));
                
                // Fetch initial votes for the new proposal
                updateProposalVotes(proposalId);
            }
        },
    });

    // Initial load
    useEffect(() => {
        fetchPastEvents();
    }, [fetchPastEvents]);

    // Update proposal statuses periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setProposals(prev => {
                const now = Math.floor(Date.now() / 1000);
                const updated = { ...prev };
                let hasChanges = false;

                Object.values(updated).forEach(proposal => {
                    const newStatus = getProposalStatus(
                        proposal.startTime,
                        proposal.endTime,
                        proposal.totalVotesFor,
                        proposal.totalVotesAgainst
                    );
                    
                    if (proposal.status !== newStatus) {
                        proposal.status = newStatus;
                        hasChanges = true;
                    }
                });

                return hasChanges ? updated : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        proposals,
        syncing,
        error,
        refreshProposals: fetchPastEvents,
        updateProposalVotes
    };
};
