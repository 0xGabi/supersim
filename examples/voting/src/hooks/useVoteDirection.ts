import { useReadContract } from 'wagmi';
import { address, abi } from '../constants/voting';

export enum VoteDirection {
    None,
    For,
    Against
}

export const useVoteDirection = (proposalId: number, voter?: string) => {
    const { data: direction } = useReadContract({
        address,
        abi,
        functionName: 'getVoterDirection',
        args: [proposalId, voter],
    });

    return {
        direction: direction as VoteDirection,
        isFor: direction === VoteDirection.For,
        isAgainst: direction === VoteDirection.Against
    };
}; 