import React from 'react';
import { Proposal } from '../hooks/useProposals';
import ProposalCard from './ProposalCard';

interface ActiveProposalsProps {
  proposals: Proposal[];
  selectedProposalId?: number;
  setSelectedProposalId: (proposalId: number) => void;
  isLoading: boolean;
}

const ActiveProposals: React.FC<ActiveProposalsProps> = ({
  proposals,
  selectedProposalId,
  setSelectedProposalId,
  isLoading
}) => {
  if (isLoading) {
    return <div style={styles.loading}>Loading active proposals...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Active Proposals</h2>
      <div style={styles.list}>
        {proposals.map(proposal => (
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
  loading: {
    padding: '20px',
    textAlign: 'center' as const,
    color: '#666',
  },
};

export default ActiveProposals; 