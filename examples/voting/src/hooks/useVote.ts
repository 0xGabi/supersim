import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { address, abi } from '../constants/voting';

export const useVote = () => {
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    const castVote = async (proposalId: number, support: boolean) => {
        try {
            await writeContract({
                address,
                abi,
                functionName: 'castVote',
                args: [proposalId, support],
            });
        } catch (error) {
            console.error('Error casting vote:', error);
            throw error;
        }
    };

    return {
        castVote,
        isPending,
        isConfirming,
    };
}; 