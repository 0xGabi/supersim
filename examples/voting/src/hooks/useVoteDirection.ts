import { useEffect, useState } from 'react';
import { useConfig, useChainId } from 'wagmi';
import { getPublicClient } from 'wagmi/actions';
import { address, abi } from '../constants/voting';

export enum VoteDirection {
    None,
    For,
    Against
}

export const useVoteDirection = (proposalId: number, voter?: string) => {
    const [direction, setDirection] = useState<VoteDirection>(VoteDirection.None);
    const config = useConfig();
    const chainId = useChainId();

    const fetchVoteDirection = async () => {
        if (!voter) return;
        
        setDirection(VoteDirection.None);

        for (const chain of config.chains) {
            const publicClient = getPublicClient(config, { chainId: chain.id });
            if (!publicClient) continue;

            try {
                // Check for direct votes (VoteCasted)
                const voteCastedLogs = await publicClient.getLogs({
                    address,
                    event: {
                        name: 'VoteCasted',
                        type: 'event',
                        inputs: [
                            { name: 'proposalId', type: 'uint256' },
                            { name: 'voter', type: 'address' },
                            { name: 'support', type: 'bool' }
                        ],
                    },
                    args: {
                        proposalId: BigInt(proposalId),
                        voter: voter
                    },
                    fromBlock: 'earliest',
                    toBlock: 'latest'
                });

                // Check for cross-chain votes (VoteSent)
                const voteSentLogs = await publicClient.getLogs({
                    address,
                    event: {
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
                    },
                    args: {
                        vote: {
                            proposalId: BigInt(proposalId),
                            voter: voter
                        }
                    },
                    fromBlock: 'earliest',
                    toBlock: 'latest'
                });

                // Check direct votes first
                if (voteCastedLogs.length > 0) {
                    const support = voteCastedLogs[0].args.support as boolean;
                    setDirection(support ? VoteDirection.For : VoteDirection.Against);
                    break;
                }

                // Then check cross-chain votes
                if (voteSentLogs.length > 0) {
                    const support = voteSentLogs[0].args.vote.support as boolean;
                    setDirection(support ? VoteDirection.For : VoteDirection.Against);
                    break;
                }
            } catch (error) {
                console.error('Error fetching vote direction:', error);
            }
        }
    };

    useEffect(() => {
        fetchVoteDirection();
    }, [voter, proposalId, chainId]);

    return {
        direction,
        isFor: direction === VoteDirection.For,
        isAgainst: direction === VoteDirection.Against,
        refetch: fetchVoteDirection
    };
}; 