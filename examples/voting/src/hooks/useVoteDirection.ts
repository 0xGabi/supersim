import { useEffect, useState } from 'react';
import { useAccount, useConfig } from 'wagmi';
import { getPublicClient } from 'wagmi/actions';
import { address, abi } from '../constants/voting';

export const useVoteDirection = (proposalId: number) => {
    const [voteDirection, setVoteDirection] = useState<boolean | undefined>();
    const { address: account } = useAccount();
    const config = useConfig();

    useEffect(() => {
        const fetchVoteDirection = async () => {
            if (!account) return;

            for (const chain of config.chains) {
                const publicClient = getPublicClient(config, { chainId: chain.id });
                if (!publicClient) continue;

                const logs = await publicClient.getLogs({
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
                        voter: account
                    },
                    fromBlock: 'earliest',
                    toBlock: 'latest'
                });

                if (logs.length > 0) {
                    setVoteDirection(logs[0].args.support as boolean);
                    break;
                }
            }
        };

        fetchVoteDirection();
    }, [account, proposalId, config.chains]);

    return voteDirection;
}; 