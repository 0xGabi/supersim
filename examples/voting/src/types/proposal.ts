import { MessageIdentifier } from "@eth-optimism/viem";

export enum VoterStatus {
    VotedFor = 0,
    VotedAgainst = 1,
}

export enum ProposalStatus {
    Pending = 0,
    Passed = 1,
    Failed = 2,
}

export interface Proposal {
    chainId: number;
    proposalId: number;

    voter: VoterStatus

    status: ProposalStatus;

    // Last event log action
    lastActionId: MessageIdentifier
    lastActionData: string
}

export type ProposalKey = `${number}-${number}-${string}`;

export const createProposalKey = (chainId: number, proposalId: number, voter: string): ProposalKey =>{
    return `${chainId}-${proposalId}-${voter.toLowerCase()}`
}