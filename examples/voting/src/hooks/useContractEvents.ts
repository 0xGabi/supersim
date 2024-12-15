import { useEffect } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { address, abi } from '../constants/voting';
import { toast } from '../components/Toast/ToastContainer';

export const useContractEvents = () => {
    // Watch for new proposals
    useWatchContractEvent({
        address,
        abi,
        eventName: 'ProposalCreated',
        onLogs(logs) {
            logs.forEach(log => {
                const proposalId = Number(log.args.proposalId);
                toast.success(
                    'New Proposal Created',
                    `Proposal #${proposalId} has been successfully created and is ready for voting.`
                );
            });
        },
    });

    // Watch for votes
    useWatchContractEvent({
        address,
        abi,
        eventName: 'VoteCasted',
        onLogs(logs) {
            logs.forEach(log => {
                const proposalId = Number(log.args.proposalId);
                const support = log.args.support;
                toast.info(
                    'Vote Recorded',
                    `A new vote has been cast ${support ? 'in favor of' : 'against'} Proposal #${proposalId}`
                );
            });
        },
    });

    // Watch for cross-chain votes
    useWatchContractEvent({
        address,
        abi,
        eventName: 'VoteSent',
        onLogs(logs) {
            logs.forEach(log => {
                const sourceChainId = Number(log.args.sourceChainId);
                const proposalId = Number(log.args.vote.proposalId);
                toast.info(
                    'Cross-Chain Vote',
                    `A vote from chain ${sourceChainId} has been processed for Proposal #${proposalId}`
                );
            });
        },
    });
}; 