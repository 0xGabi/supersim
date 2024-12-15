import React from 'react';

interface CrossChainVotingLogoProps {
    width?: string;
    height?: string;
}

const CrossChainVotingLogo: React.FC<CrossChainVotingLogoProps> = ({ width = '56', height = '56' }) => {
  return (
    <div>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 56 56" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect 
          x="0.777766" 
          y="0.777888" 
          width="54.4448" 
          height="54.4442" 
          rx="5.44437" 
          stroke="#404454" 
          strokeWidth="1.55553"
        />
        {/* Chain Link Symbol */}
        <path 
          d="M28 14C20.268 14 14 20.268 14 28C14 35.732 20.268 42 28 42C35.732 42 42 35.732 42 28C42 20.268 35.732 14 28 14ZM28 38C22.486 38 18 33.514 18 28C18 22.486 22.486 18 28 18C33.514 18 38 22.486 38 28C38 33.514 33.514 38 28 38Z" 
          fill="#404454"
        />
        {/* Checkmark/Vote Symbol */}
        <path 
          d="M34 24L26 32L22 28" 
          stroke="#404454" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Connection Lines */}
        <path 
          d="M20 20L24 24M36 36L32 32" 
          stroke="#404454" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default CrossChainVotingLogo;