import { useReadContract } from 'wagmi'
import { address, abi } from '../constants/voting'

export const useHasVote = (proposalId: number, voter: `0x${string}`) => {
    const { data: hasVoted, refetch } = useReadContract({
        address,
        abi,
        functionName: 'hasVoted',
        args: [proposalId, voter]
    });

    return {
        hasVoted: !!hasVoted,
        refetch
    };
}