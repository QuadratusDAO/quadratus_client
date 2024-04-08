import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";

export const getProvider = (wallet: any) => {
  const network = import.meta.env.VITE_SOLANA_RPC;
  const commitment = "confirmed" as const;
  const opts = {
    preflightCommitment: commitment,
  };

  const connection = new Connection(network, "confirmed");

  const providerWallet = wallet.provider || new NodeWallet(new Keypair());

  const provider = new AnchorProvider(connection, providerWallet, opts);

  return provider;
};

export const createAssociatedTokenAccount = async (
  wallet: any,
  mintPublicKey: any,
  isFee: boolean = false
) => {
  try {
    const connection = new Connection(
      import.meta.env.VITE_SOLANA_RPC,
      "confirmed"
    );

    if (isFee) {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        wallet
      );

      return associatedTokenAddress;
    }

    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPublicKey,
      wallet.publicKey
    );

    // Check if the associated token account already exists
    const associatedTokenAccountInfo = await connection.getAccountInfo(
      associatedTokenAddress
    );

    if (associatedTokenAccountInfo) {
      return associatedTokenAddress;
    }

    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey, // Payer of the transaction (also the owner of the new token account)
        associatedTokenAddress, // Associated token account address to be created
        wallet.publicKey, // Owner of the new account
        mintPublicKey, // Mint for the token
        TOKEN_PROGRAM_ID, // SPL Token program account
        ASSOCIATED_TOKEN_PROGRAM_ID // SPL Associated Token program account
      )
    );

    // get recent blockhash
    const blockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send the transaction using the wallet
    const signature = await wallet.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");

    return associatedTokenAddress;
  } catch (error) {
    console.error("Failed to create associated token account:", error);
    throw error;
  }
};

export const getTokenMetadata = async (mint: string) => {
  try {
    const connection = new Connection(import.meta.env.VITE_SOLANA_RPC);
    const metaplex = Metaplex.make(connection);

    const mintAddress = new PublicKey(mint);

    const metadataAccount = metaplex
      .nfts()
      .pdas()
      .metadata({ mint: mintAddress });

    const metadataAccountInfo = await connection.getAccountInfo(
      metadataAccount
    );

    if (!metadataAccountInfo) return "Unknown";

    const token = await metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress });

    return token.symbol;
  } catch (e) {
    console.log(e);
  }
};

export const parseLargeNumbers = (num: any, decimals: number) => {
  try {
    num = Number(num) / Math.pow(10, decimals);

    if (num >= 1000000000000) {
      return (num / 1000000000000).toFixed(2) + "T";
    }

    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + "B";
    }

    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    }

    if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }

    return num.toFixed(2);
  } catch (e) {
    console.log(e);
  }
};

export const parseEndDateCountdown = (endDate: number) => {
  try {
    const now = Date.now();
    const end = endDate * 1000;

    const diff = end - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // check if the proposal has ended
    if (diff < 0) {
      return "Ended";
    }

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } catch (e) {
    console.log(e);
  }
};

export const elipsisLongNames = (name: string) => {
  try {
    if (name.length > 20) {
      return name.slice(0, 20) + "...";
    } else {
      return name;
    }
  } catch (e) {
    console.log(e);
  }
};

export const parseProposalStatus = (proposal: any) => {
  try {
    const proposalEndDate = proposal.endDate.toNumber() * 1000;

    if (proposalEndDate > Date.now()) {
      return "Live";
    }

    if (proposalEndDate < Date.now() && proposal.status === 0) {
      if (proposal.yesVotes > proposal.noVotes) {
        return "Passed";
      }
    }

    if (proposalEndDate < Date.now() && proposal.status === 2) {
      return "Failed";
    }

    if (proposalEndDate < Date.now() && proposal.status === 1) {
      if (proposal.yesVotes > proposal.noVotes) {
        return "Executed";
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export const parseMinYesVotes = (votes: number, minYesVotes: number) => {
  try {
    // return the percentage of votes required and the message
    if (votes >= minYesVotes) {
      return {
        percentage: 100,
        message: "Minimum Yes Votes reached",
        bool: true,
      };
    }

    return {
      percentage: (votes / minYesVotes) * 100,
      message: `${minYesVotes - votes} more Yes votes required`,
      bool: false,
    };
  } catch (e) {
    console.log(e);
  }
};

export const parseAddress = (address: string) => {
  try {
    if (!address) return "Unknown Address";

    address = address.toString();
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  } catch (e) {
    console.log(e);
  }
};

export const handleClickAddress = (address: string) => {
  try {
    if (!address) return;

    window.open(
      `https://explorer.solana.com/address/${address}?cluster=${
        import.meta.env.VITE_NETWORK
      }`,
      "_blank"
    );
  } catch (e) {
    console.log(e);
  }
};

export const loadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>

      <div className="flex flex-col items-center justify-center w-full gap-4">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p className="text-lg">Please wait a moment.</p>
      </div>
    </div>
  );
};
