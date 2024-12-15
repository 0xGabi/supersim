export const parseBlockchainError = (error: any): string => {
    // Check if it's a user rejection
    if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        return 'Transaction was rejected by user';
    }

    // Check for specific contract errors
    if (error.data?.message) {
        // Remove the "execution reverted:" prefix if present
        const message = error.data.message.replace('execution reverted:', '').trim();
        
        // Map contract error messages to user-friendly messages
        switch (message) {
            case 'CallerNotL2ToL2CrossDomainMessenger':
                return 'Invalid cross-chain message sender';
            case 'InvalidCrossDomainSender':
                return 'Invalid cross-chain sender address';
            case 'NotGovernanceChain':
                return 'Operation must be performed on governance chain';
            case 'InvalidDestination':
                return 'Invalid destination chain';
            case 'ProposalNotActive':
                return 'This proposal is not currently active';
            case 'AlreadyVoted':
                return 'You have already voted on this proposal';
            case 'VotingPeriodNotEnded':
                return 'The voting period has not ended yet';
            default:
                return message;
        }
    }

    // Check for network errors
    if (error.message?.includes('network')) {
        return 'Network error. Please check your connection and try again';
    }

    // Check for insufficient funds
    if (error.message?.includes('insufficient funds')) {
        return 'Insufficient funds to complete this transaction';
    }

    // Generic error message as fallback
    return 'An error occurred while processing your transaction';
}; 