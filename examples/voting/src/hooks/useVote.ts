import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { address, abi } from '../constants/voting';

export const useVote = () => {
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash,
        onSuccess: () => {
            // Transaction confirmed successfully
            console.log('Vote cast successfully');
        },
    });

    const castVote = async (proposalId: number, support: boolean) => {
        try {
            await writeContract({
                address,
                abi,
                functionName: 'castVote',
                args: [BigInt(proposalId), support],
            });
            return { success: true };
        } catch (error) {
            console.error('Error casting vote:', error);
            return {
                success: false,
                error: parseBlockchainError(error)
            };
        }
    };

    return {
        castVote,
        isPending,
        isConfirming,
    };
}; 