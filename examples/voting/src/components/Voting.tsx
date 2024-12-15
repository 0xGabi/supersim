import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { truncateAddress } from '../utils/address';
import { useProposals } from '../hooks/useProposals';

import Connect from './Connect';
import VotingLogo from './VotingLogo';
import ChainLogo from './ChainLogo';
import ProposalControls from './ProposalControls';
import ProposalList from './ProposalList';

const Voting: React.FC = () => {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [selectedProposalId, setSelectedProposalId] = useState<number | undefined>();
  const { proposals, syncing } = useProposals();

  if (!isConnected) {
    return <Connect onConnect={() => connect({ connector: connectors[0] })} />;
  }

  // Edge case. If the wallet was switched, clear the selected proposal
  if (!syncing && selectedProposalId) {
    setSelectedProposalId(undefined);
  }

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>
              <VotingLogo />
            </span>
            SuperVote
          </div>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '14px', gap: '4px' }}>
              <span>Chain ID: {chainId}</span>
              <span>Address: {truncateAddress(address!)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '6px', margin: '0px 10px 2px' }}>
              <ChainLogo size='20px' chainId={BigInt(chainId!)} />
              <button onClick={() => disconnect()} style={styles.disconnectButton}>✕</button>
            </div>
          </div>
        </header>
        <main style={styles.main}>
          <div style={styles.leftContainer}>
            <ProposalControls />
          </div>
          <div style={styles.rightContainer}>
            <ProposalList 
              proposals={proposals}
              selectedProposalId={selectedProposalId}
              setSelectedProposalId={setSelectedProposalId}
              isLoading={syncing}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    boxSizing: 'border-box' as const,
    width: '100%',
    height: '100%',
    padding: '30px 5% 60px',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    height: '10%'
  },
  main: {
    display: 'flex',
    boxSizing: 'border-box' as const,
    gap: '25px',
    flex: 1,
    paddingTop: '20px',
    height: '90%',
  },
  leftContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto' as const,
    minWidth: '175px',
  },
  rightContainer: {
    flex: 4,
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto' as const,
    minWidth: '470px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    display: 'flex',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: '10px',
  },
  chainInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
  },
  disconnectButton: {
    background: 'none',
    border: 'none',
    color: 'black',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0px',
    margin: '0px',
  },
};

export default Voting;