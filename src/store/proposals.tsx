import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";

interface Proposal {
  id: string;
  creator: PublicKey | undefined;
  dao: PublicKey | undefined;
  beneficiary: PublicKey | undefined;
  title: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  tokenAmount: number;
  status: number; // 0 = active; 1 = passed; 2 = failed
  action: number; // 0 = burn; 1 = transfer
  endDate: number;
  executed: boolean;
  burnOnVote: boolean;
  setProposal: (proposal: Proposal) => void;
}

interface Proposals {
  proposals: Proposal[];
  setProposals: (proposals: Proposal[]) => void;
}

export const useProposalsStore = create<Proposals>((set) => ({
  proposals: [],
  setProposals: (proposals) => set({ proposals }),
}));

export const useProposalStore = create<Proposal>((set) => ({
  id: "",
  creator: undefined,
  dao: undefined,
  beneficiary: undefined,
  title: "",
  description: "",
  yesVotes: 0,
  noVotes: 0,
  tokenAmount: 0,
  status: 0,
  action: 0,
  endDate: 0,
  executed: false,
  burnOnVote: false,
  setProposal: (proposal) => set(proposal),
}));
