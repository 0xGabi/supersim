import React from 'react';
import { Proposal } from '../hooks/useProposals';

interface PastProposalsProps {
  proposals: Proposal[];
  selectedProposalId?: number;
  setSelectedProposalId: (proposalId: number) => void;
  isLoading: boolean;
}

const PastProposals: React.FC<PastProposalsProps> = ({
  proposals,
  selectedProposalId,
  setSelectedProposalId,
  isLoading
}) => {
  if (isLoading) {
    return <div style={styles.loading}>Loading past proposals...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Past Proposals</h2>
      <div style={styles.list}>
        {proposals.map(proposal => (
          <div
            key={proposal.id}
            style={{
              ...styles.proposalItem,
              backgroundColor: selectedProposalId === proposal.id ? '#f0f0f0' : 'transparent'
            }}
            onClick={() => setSelectedProposalId(proposal.id)}
          >
            <h3 style={styles.proposalTitle}>{proposal.description}</h3>
            <div style={styles.voteCount}>
              For: {proposal.totalVotesFor} | Against: {proposal.totalVotesAgainst}
            </div>
            <div style={styles.status}>{proposal.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  proposalItem: {
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    opacity: 0.8,
  },
  proposalTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
  },
  voteCount: {
    fontSize: '14px',
    color: '#666',
  },
  status: {
    fontSize: '12px',
    color: '#888',
    marginTop: '5px',
  },
  loading: {
    padding: '20px',
    textAlign: 'center' as const,
    color: '#666',
  },
};

export default PastProposals; 