import React, { useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { useVote } from '../hooks/useVote';
import { Proposal, ProposalStatus } from '../hooks/useProposals';

interface ProposalCardProps {
    proposal: Proposal;
    selected: boolean;
    onSelect: () => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
    proposal,
    selected,
    onSelect,
}) => {
    const timeLeft = useCountdown(proposal.endTime);
    const { castVote, isPending, isConfirming } = useVote();
    const [error, setError] = useState<string | null>(null);

    const handleVote = async (support: boolean) => {
        setError(null);
        try {
            await castVote(proposal.id, support);
        } catch (error) {
            setError('Failed to cast vote. Please try again.');
        }
    };

    const getStatusColor = (status: ProposalStatus) => {
        switch (status) {
            case ProposalStatus.Active:
                return { bg: '#E3F2FD', text: '#1976D2' };
            case ProposalStatus.Passed:
                return { bg: '#E8F5E9', text: '#2E7D32' };
            case ProposalStatus.Failed:
                return { bg: '#FFEBEE', text: '#C62828' };
            case ProposalStatus.Pending:
                return { bg: '#FFF3E0', text: '#E65100' };
            default:
                return { bg: '#F5F5F5', text: '#424242' };
        }
    };

    const statusColors = getStatusColor(proposal.status);

    const getVoteStatus = () => {
        if (!proposal.hasVoted) return null;
        
        // Check if the vote was in favor or against
        // This would require tracking the user's vote direction in the proposal
        const voteDirection = proposal.userVoteDirection;
        const icon = voteDirection ? '✓' : '✗';
        const color = voteDirection ? '#2E7D32' : '#C62828';
        const text = voteDirection ? 'Voted For' : 'Voted Against';
        
        return { icon, color, text };
    };

    const voteStatus = getVoteStatus();

    return (
        <div
            style={{
                ...styles.container,
                backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : 'white',
                borderColor: selected ? '#1976D2' : '#E0E0E0',
            }}
            onClick={onSelect}
        >
            <div style={styles.header}>
                <h3 style={styles.title}>{proposal.description}</h3>
                <div style={{
                    ...styles.status,
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                }}>
                    {proposal.status}
                </div>
            </div>
            
            <div style={styles.stats}>
                <div style={styles.votes}>
                    <div style={styles.voteCount}>
                        <span style={styles.voteLabel}>For:</span>
                        <span style={{...styles.voteNumber, color: '#2E7D32'}}>{proposal.totalVotesFor}</span>
                    </div>
                    <div style={styles.voteCount}>
                        <span style={styles.voteLabel}>Against:</span>
                        <span style={{...styles.voteNumber, color: '#C62828'}}>{proposal.totalVotesAgainst}</span>
                    </div>
                </div>
                {proposal.status === ProposalStatus.Active && (
                    <div style={styles.timeLeft}>
                        <span style={styles.timeLabel}>Time left:</span>
                        <span style={styles.timeValue}>{timeLeft}</span>
                    </div>
                )}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {proposal.status === ProposalStatus.Active && !proposal.hasVoted && (
                <div style={styles.voteButtons}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVote(true);
                        }}
                        style={{...styles.voteButton, ...styles.voteForButton}}
                        disabled={isPending || isConfirming}
                    >
                        {isPending || isConfirming ? 'Voting...' : 'Vote For'}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVote(false);
                        }}
                        style={{...styles.voteButton, ...styles.voteAgainstButton}}
                        disabled={isPending || isConfirming}
                    >
                        {isPending || isConfirming ? 'Voting...' : 'Vote Against'}
                    </button>
                </div>
            )}
            
            {proposal.hasVoted && (
                <div style={{
                    ...styles.votedBadge,
                    backgroundColor: voteStatus?.color ? `${voteStatus.color}15` : '#F5F5F5',
                    color: voteStatus?.color || '#1976D2',
                    border: `1px solid ${voteStatus?.color}30` || '#E0E0E0'
                }}>
                    <span style={{
                        ...styles.votedIcon,
                        color: voteStatus?.color || '#2E7D32'
                    }}>
                        {voteStatus?.icon || '✓'}
                    </span>
                    {voteStatus?.text || 'Vote Cast'}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #E0E0E0',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        ':hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
    },
    title: {
        margin: '0',
        fontSize: '16px',
        fontWeight: '600' as const,
        color: '#1A1A1A',
        flex: 1,
        lineHeight: '1.4',
    },
    status: {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '500' as const,
        marginLeft: '12px',
        whiteSpace: 'nowrap' as const,
    },
    stats: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    votes: {
        display: 'flex',
        gap: '20px',
    },
    voteCount: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    voteLabel: {
        fontSize: '14px',
        color: '#666',
        fontWeight: '500' as const,
    },
    voteNumber: {
        fontSize: '16px',
        fontWeight: '600' as const,
    },
    timeLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    timeLabel: {
        fontSize: '14px',
        color: '#666',
        fontWeight: '500' as const,
    },
    timeValue: {
        fontSize: '14px',
        color: '#1976D2',
        fontWeight: '600' as const,
    },
    voteButtons: {
        display: 'flex',
        gap: '12px',
        marginTop: '16px',
    },
    voteButton: {
        flex: 1,
        padding: '10px 16px',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600' as const,
        transition: 'all 0.2s ease',
        ':disabled': {
            opacity: 0.7,
            cursor: 'not-allowed',
        },
    },
    voteForButton: {
        backgroundColor: '#2E7D32',
        ':hover': {
            backgroundColor: '#1B5E20',
        },
    },
    voteAgainstButton: {
        backgroundColor: '#C62828',
        ':hover': {
            backgroundColor: '#B71C1C',
        },
    },
    votedBadge: {
        marginTop: '16px',
        textAlign: 'center' as const,
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
    },
    votedIcon: {
        fontWeight: 'bold' as const,
        fontSize: '16px',
    },
    error: {
        color: '#C62828',
        backgroundColor: '#FFEBEE',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        marginTop: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
};

export default ProposalCard; 