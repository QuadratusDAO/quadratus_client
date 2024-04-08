import React from "react";
import { useWalletStore, useDaoStore } from "../store";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import idl from "../idl.json";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { getProvider } from "../utils/helpers";
import { toast } from "react-toastify";

const JoinDAOButton: React.FC = (): any => {
  const dao = useDaoStore();

  const wallet = useWalletStore();
  const parsedIdl = JSON.parse(JSON.stringify(idl));
  const programID = new PublicKey(idl.metadata.address);

  const handleJoinDAO = async () => {
    try {
      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      const daoPDA = new PublicKey(dao.id);

      if (!wallet.publicKey) {
        toast.error("Please connect your wallet first");
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

      const [membershipPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("membership"),
          daoPDA.toBuffer(),
          new PublicKey(wallet.publicKey).toBuffer(),
        ],
        program.programId
      );

      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury_vault"), daoPDA.toBuffer()],
        program.programId
      );

      await program.methods
        .joinDao()
        .accounts({
          dao: daoPDA,
          membership: membershipPDA,
          treasuryVault: treasuryPDA,
          userTokenMintAccount: userTokenMintAccount,
          user: new PublicKey(wallet.publicKey),
          tokenMint: dao.tokenMint.address,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
        .then(() => {
          toast.success("Successfully joined DAO");
          dao.setDAO({
            ...dao,
            membersList: dao.membersList.concat({
              pubkey: new PublicKey(wallet.publicKey),
            }),
          });
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
      <div className="flex flex-row gap-4">
        <button
          onClick={() => handleJoinDAO()}
          className={`font-inter ${
            !wallet.publicKey ? "disabled" : ""
          } flex gap-2 bg-offBlack items-center  hover:bg-offBlackHover text-white rounded-md p-2`}
        >
          <UserPlusIcon className="h-6 w-6" />
          Join DAO
        </button>
      </div>
    </>
  );
};

export default JoinDAOButton;
