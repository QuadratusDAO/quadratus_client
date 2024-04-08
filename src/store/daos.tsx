import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";

interface DAO {
  id: string;
  name: string;
  image: string;
  treasuryVault: PublicKey | undefined;
  burnVault: PublicKey | undefined;
  totalProposals: number;
  treasury: any;
  burnedVault: any;
  tokenMint: any;
  tokenTicker: string;
  proposalsList: any;
  membersList: any;
  isMember: boolean;
  minYesVotes: number;
  proposalCreationFee: number;
  membershipFee: number;
  setDAO: (dao: DAO) => void;
}

interface DAOS {
  daos: DAO[];
  setDAOs: (daos: DAO[]) => void;
}

export const useDaosStore = create<DAOS>((set) => ({
  daos: [],
  setDAOs: (daos) => set({ daos }),
}));

export const useDaoStore = create<DAO>((set) => ({
  id: "",
  name: "",
  image: "",
  treasuryVault: undefined,
  burnVault: undefined,
  burnedVault: undefined,
  totalProposals: 0,
  treasury: undefined,
  tokenMint: undefined,
  tokenTicker: "",
  proposalsList: undefined,
  membersList: undefined,
  isMember: false,
  minYesVotes: 0,
  proposalCreationFee: 0,
  membershipFee: 0,
  setDAO: (dao) => set(dao),
}));
