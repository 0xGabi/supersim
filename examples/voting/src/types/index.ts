export type ChainId = number;

export interface VoteTransaction {
    hash: string;
    proposalId: number;
    support: boolean;
    voter: string;
}

export interface ProposalCreationParams {
    description: string;
    votingPeriod: number;
} 