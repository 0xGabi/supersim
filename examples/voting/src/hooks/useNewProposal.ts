import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { address, abi } from '../constants/voting'

export const useNewProposal = () => {
    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
        hash,
        onSuccess(data) {
            // Transaction was successful
            console.log('Proposal created successfully:', data);
        },
    })

    const createNewProposal = async (description: string, votingPeriod: number) => {
        try {
            await writeContract({
                address,
                abi,
                functionName: 'createProposal',
                args: [description, BigInt(votingPeriod)]
            });
        } catch (error) {
            console.error('Error creating new proposal:', error);
            throw error;
        }
    }

    return {
        createNewProposal,
        isPending,
        isConfirming,
        isSuccess,
        hash
    }
}