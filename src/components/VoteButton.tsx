import React from "react";
import { useWalletStore, useDaoStore, useProposalStore } from "../store";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, BN } from "@project-serum/anchor";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import idl from "../idl.json";

import { getProvider } from "../utils/helpers";
import { toast } from "react-toastify";

const VoteButton: React.FC<any> = (props) => {
  const dao = useDaoStore();
  const proposal = useProposalStore();

  const wallet = useWalletStore();
  const parsedIdl = JSON.parse(JSON.stringify(idl));
  const programID = new PublicKey(idl.metadata.address);

  const handleCastVotes = async (side: number) => {
    try {
      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      const daoPDA = new PublicKey(dao.id);
      const proposalPDA = new PublicKey(proposal.id);

      if (!wallet.publicKey) {
        toast.error("Please connect your wallet to cast a vote.");
        return;
      }

      if (!daoPDA || !dao.tokenMint) {
        toast.error(
          "Error fetching DAO and token mint data. Please try again."
        );
        return;
      }

      const userTokenMintAccount = await getAssociatedTokenAddress(
        dao.tokenMint.address,
        new PublicKey(wallet.publicKey)
      );

      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury_vault"), daoPDA.toBuffer()],
        program.programId
      );

      const [burnPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("burn"), daoPDA.toBuffer()],
        program.programId
      );

      const [userProposalVotesPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_proposal_votes"),
          new PublicKey(wallet.publicKey).toBuffer(),
          proposalPDA.toBuffer(),
        ],
        program.programId
      );

      const [membershipPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("membership"),
          daoPDA.toBuffer(),
          new PublicKey(wallet.publicKey).toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .voteOnProposal(new BN(props.amount), side)
        .accounts({
          dao: daoPDA,
          proposal: proposalPDA,
          userProposalVotes: userProposalVotesPDA,
          treasuryVault: treasuryPDA,
          burnVault: burnPDA,
          userTokenMintAccount: userTokenMintAccount,
          membership: membershipPDA,
          user: new PublicKey(wallet.publicKey),
          tokenMint: dao.tokenMint.address,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
        .then(() => {
          toast.success("Vote casts successfully!");
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <button
        onClick={() => handleCastVotes(1)}
        className="flex items-center justify-center bg-offBlack text-white p-2 w-[200px] rounded-md hover:bg-offBlackHover"
      >
        Yes
      </button>

      <button
        onClick={() => handleCastVotes(0)}
        className="flex items-center justify-center bg-offBlack text-white p-2 w-[200px] rounded-md hover:bg-offBlackHover"
      >
        No
      </button>
    </>
  );
};

export default VoteButton;
