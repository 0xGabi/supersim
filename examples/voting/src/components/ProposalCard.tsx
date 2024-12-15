import React, { useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { useVote } from '../hooks/useVote';
import { Proposal, ProposalStatus } from '../hooks/useProposals';
import { useAccount } from 'wagmi';
import { useHasVote } from '../hooks/useHasVote';

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
    const { address } = useAccount();
    const hasVoted = address ? useHasVote(proposal.id, address) : false;
    const [error, setError] = useState<string | null>(null);

    const handleVote = async (support: boolean) => {
        setError(null);
        try {
            const result = await castVote(proposal.id, support);
            if (!result.success) {
                setError(result.error || 'Failed to cast vote');
            }
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

    const getVoteStatusDisplay = () => {
        if (!hasVoted) return null;

        const voteText = proposal.userVoteDirection ? 'Voted For' : 'Voted Against';
        const voteColor = proposal.userVoteDirection ? '#2E7D32' : '#C62828';
        const voteIcon = proposal.userVoteDirection ? '✓' : '✗';

        return (
            <div style={{
                ...styles.votedBadge,
                backgroundColor: `${voteColor}15`,
                color: voteColor,
                border: `1px solid ${voteColor}30`
            }}>
                <span style={{...styles.votedIcon, color: voteColor}}>
                    {voteIcon}
                </span>
                {voteText}
            </div>
        );
    };

    const getLoadingMessage = () => {
        if (isPending) return 'Please sign the transaction...';
        if (isConfirming) return 'Processing vote...';
        return '';
    };

    return (
        <div
            style={{
                ...styles.container,
                backgroundColor: selected ? 'rgba(25, 118, 210, 0.08)' : 'white',
                borderColor: selected ? '#1976D2' : '#E0E0E0',
                position: 'relative',
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

            {error && (
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <div style={styles.errorMessage}>{error}</div>
                </div>
            )}

            {proposal.status === ProposalStatus.Active && !hasVoted && (
                <div style={styles.voteButtons}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVote(true);
                        }}
                        style={{...styles.voteButton, ...styles.voteForButton}}
                        disabled={isPending || isConfirming}
                    >
                        Vote For
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVote(false);
                        }}
                        style={{...styles.voteButton, ...styles.voteAgainstButton}}
                        disabled={isPending || isConfirming}
                    >
                        Vote Against
                    </button>
                </div>
            )}

            {hasVoted && getVoteStatusDisplay()}

            {(isPending || isConfirming) && (
                <div style={styles.loadingOverlay}>
                    <div style={styles.loadingContent}>
                        <div style={styles.loadingSpinner} />
                        <span>{getLoadingMessage()}</span>
                    </div>
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
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#FFEBEE',
        color: '#C62828',
    },
    errorIcon: {
        fontSize: '16px',
        fontWeight: 'bold',
    },
    errorMessage: {
        fontSize: '14px',
    },
    loadingOverlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        zIndex: 10,
    },
    loadingContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '12px',
    },
    loadingSpinner: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '3px solid #1976D2',
        borderTop: '3px solid transparent',
        animation: 'spin 1s linear infinite',
    },
};

export default ProposalCard; 