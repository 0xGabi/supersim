import React from 'react';
import { Proposal } from '../hooks/useProposals';
import ProposalCard from './ProposalCard';

interface ProposalListProps {
    proposals: Record<number, Proposal>;
    selectedProposalId?: number;
    setSelectedProposalId: (id: number) => void;
    isLoading: boolean;
}

const ProposalList: React.FC<ProposalListProps> = ({
    proposals,
    selectedProposalId,
    setSelectedProposalId,
    isLoading
}) => {
    const proposalList = Object.values(proposals);

    if (isLoading) {
        return <div style={styles.message}>Loading proposals...</div>;
    }

    if (proposalList.length === 0) {
        return (
            <div style={styles.emptyState}>
                <h3 style={styles.emptyTitle}>No Proposals Yet</h3>
                <p style={styles.emptyText}>
                    Be the first to create a proposal! Use the form on the left to get started.
                </p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.list}>
                {proposalList
                    .sort((a, b) => b.startTime - a.startTime)
                    .map(proposal => (
                        <ProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            selected={selectedProposalId === proposal.id}
                            onSelect={() => setSelectedProposalId(proposal.id)}
                        />
                    ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        gap: '20px',
    },
    list: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    },
    message: {
        textAlign: 'center' as const,
        padding: '20px',
        color: '#666',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center' as const,
        backgroundColor: '#F5F5F5',
        borderRadius: '12px',
        margin: '20px 0',
    },
    emptyTitle: {
        color: '#1976D2',
        fontSize: '20px',
        marginBottom: '12px',
        fontWeight: '600',
    },
    emptyText: {
        color: '#666',
        fontSize: '16px',
        margin: 0,
        maxWidth: '400px',
        lineHeight: '1.5',
    },
};

export default ProposalList; 