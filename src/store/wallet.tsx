import { create } from "zustand";

const localStorageKey = "walletState";

interface WalletState {
  providerName: string;
  provider?: any;
  publicKey: string;
  balance: number;
  connected: boolean;
  setProviderName: (provider: string) => void;
  setProvider: (provider: any) => void;
  setBalance: (balance: number) => void;
  setConnected: (connected: boolean) => void;
  setPublicKey: (publicKey: string) => void;
  updateWallet: (updates: Partial<WalletState>) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  providerName: "",
  balance: 0,
  publicKey: "",
  connected: false,
  setProviderName: (providerName) => set({ providerName }),
  setProvider: (provider) => set({ provider }),
  setBalance: (balance) => set({ balance }),
  setConnected: (connected) => set({ connected }),
  setPublicKey: (publicKey) => set({ publicKey }),
  updateWallet: (updates: Partial<WalletState>) => {
    set((state) => ({ ...state, ...updates }));
  },
  disconnect: () => {
    set({
      provider: undefined,
      providerName: "",
      balance: 0,
      publicKey: "",
      connected: false,
    });

    localStorage.removeItem(localStorageKey);
  },
}));
