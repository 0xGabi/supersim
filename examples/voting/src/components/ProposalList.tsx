import React from 'react';
import { Proposal } from '../hooks/useProposals';
import ActiveProposals from './ActiveProposals';
import PastProposals from './PastProposals';

interface ProposalListProps {
  proposals: Record<number, Proposal>;
  selectedProposalId?: number;
  setSelectedProposalId: (proposalId: number) => void;
  isLoading: boolean;
}

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  selectedProposalId,
  setSelectedProposalId,
  isLoading
}) => {
  const activeProposals = Object.values(proposals).filter(
    proposal => proposal.status === 'Active' || proposal.status === 'Pending'
  );
  
  const pastProposals = Object.values(proposals).filter(
    proposal => proposal.status === 'Passed' || proposal.status === 'Failed'
  );

  return (
    <div style={styles.container}>
      <ActiveProposals 
        proposals={activeProposals}
        selectedProposalId={selectedProposalId}
        setSelectedProposalId={setSelectedProposalId}
        isLoading={isLoading}
      />
      <PastProposals 
        proposals={pastProposals}
        selectedProposalId={selectedProposalId}
        setSelectedProposalId={setSelectedProposalId}
        isLoading={isLoading}
      />
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
};

export default ProposalList; 