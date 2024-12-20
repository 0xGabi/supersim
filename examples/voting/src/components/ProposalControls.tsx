import React, { useState } from 'react';
import { useNewProposal } from '../hooks/useNewProposal';
import { useChainId } from 'wagmi';
import { supersimL2A } from '@eth-optimism/viem';

const ProposalControls: React.FC = () => {
    const { createNewProposal, isPending, isConfirming, isSuccess } = useNewProposal();
    const chainId = useChainId();
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('5');
    const [error, setError] = useState<string | null>(null);

    const isGovernanceChain = chainId === supersimL2A.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        try {
            const votingPeriod = Number(duration) * 60;
            await createNewProposal(description, votingPeriod);
            
            if (isSuccess) {
                setDescription('');
                setDuration('5');
            }
        } catch (error) {
            console.error('Failed to create proposal:', error);
            setError('Failed to create proposal. Please try again.');
        }
    };

    if (!isGovernanceChain) {
        return (
            <div style={styles.container}>
                <div style={styles.infoMessage}>
                    <div style={styles.infoContent}>
                        <div>
                            <h3 style={styles.infoTitle}>Switch to the Governance Chain to Create Proposals</h3>
                            <p style={styles.infoText}>
                                To create a new proposal, please connect to <span style={styles.chainName}>{supersimL2A.name}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Create New Proposal</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label htmlFor="description" style={styles.label}>
                        Proposal Description:
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={styles.textarea}
                        placeholder="Enter your proposal description..."
                        required
                        disabled={isPending || isConfirming}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="duration" style={styles.label}>
                        Voting Duration (minutes):
                    </label>
                    <input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        style={styles.input}
                        min="1"
                        max="60"
                        required
                        disabled={isPending || isConfirming}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        ...styles.submitButton,
                        opacity: isPending || isConfirming ? 0.5 : 1,
                        cursor: isPending || isConfirming ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isPending || isConfirming}
                >
                    {isConfirming ? 'Creating Proposal...' : 'Create Proposal'}
                </button>
            </form>
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    title: {
        margin: '0 0 20px 0',
        fontSize: '24px',
        fontWeight: 'bold' as const,
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    label: {
        fontWeight: '500' as const,
        color: '#444',
        fontSize: '14px',
    },
    textarea: {
        minHeight: '150px',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        resize: 'vertical' as const,
        backgroundColor: 'white',
        color: '#333',
        '::placeholder': {
            color: '#999',
        },
    },
    input: {
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        backgroundColor: 'white',
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#FF0420',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '14px 24px',
        fontSize: '16px',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#E6041D',
        },
    },
    error: {
        color: '#FF0420',
        fontSize: '14px',
        marginTop: '10px',
    },
    infoMessage: {
        backgroundColor: '#E3F2FD',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #90CAF9',
    },
    infoContent: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
    },
    infoIcon: {
        fontSize: '24px',
        lineHeight: '1',
    },
    infoTitle: {
        margin: '0 0 8px 0',
        color: '#1976D2',
        fontSize: '18px',
        fontWeight: '600',
    },
    infoText: {
        margin: 0,
        color: '#424242',
        fontSize: '14px',
        lineHeight: '1.5',
    },
    chainName: {
        color: '#1976D2',
        fontWeight: '600',
    },
};

export default ProposalControls;