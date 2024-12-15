import React from 'react';
import { Proposal, ProposalStatus } from '../hooks/useProposals';
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
    const now = Math.floor(Date.now() / 1000);

    const activeProposals = proposalList
        .filter(p => p.endTime >= now)
        .sort((a, b) => b.startTime - a.startTime);

    const pastProposals = proposalList
        .filter(p => p.endTime < now)
        .sort((a, b) => b.endTime - a.endTime);

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
            {/* Active Proposals Section */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Active Proposals</h2>
                {activeProposals.length === 0 ? (
                    <p style={styles.noProposalsMessage}>No active proposals at the moment</p>
                ) : (
                    <div style={styles.list}>
                        {activeProposals.map(proposal => (
                            <ProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                selected={selectedProposalId === proposal.id}
                                onSelect={() => setSelectedProposalId(proposal.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Past Proposals Section */}
            {pastProposals.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Past Proposals</h2>
                    <div style={{...styles.list, opacity: 0.8}}>
                        {pastProposals.map(proposal => (
                            <div key={proposal.id} style={styles.pastProposalWrapper}>
                                <ProposalCard
                                    proposal={proposal}
                                    selected={selectedProposalId === proposal.id}
                                    onSelect={() => setSelectedProposalId(proposal.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '32px',
    },
    section: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
        margin: '0',
    },
    list: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    },
    pastProposalWrapper: {
        position: 'relative' as const,
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            pointerEvents: 'none',
            borderRadius: '12px',
        }
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
    noProposalsMessage: {
        color: '#666',
        fontSize: '14px',
        fontStyle: 'italic',
        margin: '0',
        padding: '12px',
        textAlign: 'center' as const,
    },
};

export default ProposalList; 