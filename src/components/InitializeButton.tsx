import React from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { useWalletStore } from "../store";
import idl from "../idl.json";
import { getProvider } from "../utils/helpers";
import { toast } from "react-toastify";

const InitializeButton: React.FC = () => {
  const wallet = useWalletStore();

  const parsedIdl = JSON.parse(JSON.stringify(idl));
  const programID = new PublicKey(idl.metadata.address);

  const initializeFee = async () => {
    try {
      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      if (!wallet.publicKey) {
        toast.error("Please connect your wallet first");
        return;
      }

      const [feePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("fee")],
        program.programId
      );

      await program.methods
        .initializeFeeAccount()
        .accounts({
          feeAccount: feePDA,
          user: new PublicKey(wallet.publicKey),
          systemProgram: SystemProgram.programId,
        })
        .rpc()
        .catch((e) => {
          console.log(e);
          toast.error("Error initializing fee account");
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-1/2 gap-4">
        <button
          onClick={initializeFee}
          className="bg-blue-400 h-full w-full font-normal transition duration-300 ease-in-out text-offWhite  hover:bg-blue-500 p-4"
        >
          Initialize fee
        </button>
      </div>
    </>
  );
};

export default InitializeButton;
