export const address = import.meta.env.VITE_VOTING_ADDRESS

export const abi = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_governanceChainId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "castVote",
        "inputs": [
            {
                "name": "_proposalId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_support",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createProposal",
        "inputs": [
            {
                "name": "_description",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "_votingPeriod",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getChainVotes",
        "inputs": [
            {
                "name": "_proposalId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_chainId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "votesFor",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "votesAgainst",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getProposal",
        "inputs": [
            {
                "name": "_proposalId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "description",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "startTime",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "endTime",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "totalVotesFor",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "totalVotesAgainst",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getVoterDirection",
        "inputs": [
            {
                "name": "_proposalId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_voter",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint8",
                "internalType": "enum VoteDirection"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "governanceChainId",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "hasVoted",
        "inputs": [
            {
                "name": "_proposalId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_voter",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "nextProposalId",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "proposals",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "id",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "description",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "startTime",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "endTime",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "totalVotesFor",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "totalVotesAgainst",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "receiveVote",
        "inputs": [
            {
                "name": "_vote",
                "type": "tuple",
                "internalType": "struct Vote",
                "components": [
                    {
                        "name": "proposalId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "voter",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "support",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "ProposalCreated",
        "inputs": [
            {
                "name": "proposalId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "description",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "startTime",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "endTime",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "VoteCasted",
        "inputs": [
            {
                "name": "proposalId",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "voter",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "support",
                "type": "bool",
                "indexed": false,
                "internalType": "bool"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "VoteSent",
        "inputs": [
            {
                "name": "sourceChainId",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "vote",
                "type": "tuple",
                "indexed": false,
                "internalType": "struct Vote",
                "components": [
                    {
                        "name": "proposalId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "voter",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "support",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "AlreadyVoted",
        "inputs": []
    },
    {
        "type": "error",
        "name": "CallerNotL2ToL2CrossDomainMessenger",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidCrossDomainSender",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotGovernanceChain",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ProposalNotActive",
        "inputs": []
    }
]
