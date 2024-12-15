import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { address, abi } from '../constants/voting'

export const useNewProposal = () => {
    const { data: hash, writeContract, isPending, isError, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    if (isError) {
        console.error('Error creating new proposal: ', error)
    }

    const createNewProposal = async (description: string, votingPeriod: number) => {
        try {
            await writeContract({ address: address, abi: abi, functionName: 'createProposal', args: [description, votingPeriod] })
        } catch (error) {
            console.error('Error creating new proposal: ',error)
            return { error }
        }
    }

    return { createNewProposal, isPending, isConfirming, isSuccess, hash }
}