import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useWalletStore } from "../store";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, BN } from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import idl from "../idl.json";
import { getProvider, loadingSpinner } from "../utils/helpers";
import { toast } from "react-toastify";

const CreateDAO: React.FC = () => {
  const navigate = useNavigate();

  const wallet = useWalletStore();
  const parsedIdl = JSON.parse(JSON.stringify(idl));
  const programID = new PublicKey(idl.metadata.address);

  const [loading, setLoading] = React.useState(true);
  const [formData, setFormData] = useState<any>({
    name: "",
    image: "",
    tokenMint: "",
    decimals: 6,
    minYesVotes: 0,
    proposalCreationFee: 0,
    membershipFee: 0,
  });

  const handleFormChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      window.scrollTo(0, 0);

      if (!wallet.publicKey) {
        toast.error("Please connect your wallet.");
        return;
      }

      if (!formData.name) {
        toast.error("Name is required.");
        return;
      }

      if (!formData.image) {
        toast.error("Please provide an image URL");
        return;
      }

      if (!formData.tokenMint) {
        toast.error("Please provide a token mint address.");
        return;
      }

      if (!formData.decimals || formData.decimals <= 0) {
        toast.error("Decimals must be greater than 0.");
        return;
      }

      setLoading(true);

      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      const [feePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("fee")],
        program.programId
      );

      const [daoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("dao"), new PublicKey(wallet.publicKey).toBuffer()],
        programID
      );

      const [adminPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("admin"),
          daoPDA.toBuffer(),
          new PublicKey(wallet.publicKey).toBuffer(),
        ],
        program.programId
      );

      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury_vault"), daoPDA.toBuffer()],
        programID
      );

      const [burnPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("burn"), daoPDA.toBuffer()],
        programID
      );

      const minYesVotes = new BN(formData.minYesVotes);

      const proposalCreationFee = new BN(
        formData.proposalCreationFee * 10 ** formData.decimals
      );

      const membershipFee = new BN(
        formData.membershipFee * 10 ** formData.decimals
      );

      await program.methods
        .createDao(
          formData.name,
          formData.image,
          minYesVotes,
          proposalCreationFee,
          membershipFee
        )
        .accounts({
          dao: daoPDA,
          admin: adminPDA,
          treasuryVault: treasuryPDA,
          burnVault: burnPDA,
          feeAccount: feePDA,
          user: new PublicKey(wallet.publicKey),
          tokenMint: new PublicKey(formData.tokenMint),
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
        .then(async () => {
          setTimeout(() => {
            navigate(`/dao/${daoPDA.toString()}`);
            setLoading(false);
          }, 2000);
        })
        .catch((e) => {
          console.log(e);
          toast.error("Failed to create DAO.");
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
      setLoading(false);
      toast.error("Failed to create DAO.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-fit min-h-[800px]">
      <div className="flex flex-col h-fit gap-4 mb-8 w-full md:px-16 px-8 justify-center items-center ">
        {!loading && (
          <>
            {/* heading */}
            <div className="flex flex-col gap-4 items-start justify-start w-1/2 mb-4">
              <div className="flex flex-col  items-start justify-start w-full">
                <h1 className="text-4xl font-bold text-center">Create DAO</h1>
                <p className="text-lg text-center">
                  Create a new DAO and start making proposals.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:w-1/2"></div>

            <form className="flex flex-col gap-4 w-full md:w-1/2">
              <div className="flex flex-col">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Name
                </label>
                <input
                  value={formData.name}
                  type="text"
                  id="name"
                  name="name"
                  onChange={handleFormChange}
                  placeholder="DAO Name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                />
              </div>

              {/* <div className="flex flex-col">
                <label
                  htmlFor="bio"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  DAO Bio
                </label>
                <textarea
                  value={formData.bio}
                  id="bio"
                  name="bio"
                  onChange={handleFormChange}
                  placeholder="Give a brief introduction to your DAO."
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  rows={4}
                />
              </div> */}

              <div className="flex flex-col">
                <label
                  htmlFor="image"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Image
                </label>
                <input
                  value={formData.image}
                  type="text"
                  id="image"
                  name="image"
                  onChange={handleFormChange}
                  placeholder="Image URL"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                />
              </div>

              {/* <div className="flex flex-col">
                <label
                  htmlFor="admins"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Admins
                </label>
                <input
                  type="text"
                  id="admins"
                  name="admins"
                  onChange={handleFormChange}
                  placeholder="Additonal admins other than yourself. (comma separated)"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                />

                <span className="text-xs text-red-500 mt-1">
                  <p>
                    The account you are signing this transaction with is
                    included automatically.
                  </p>
                </span>
              </div> */}

              <div className="flex flex-row justify-between gap-4 items-end">
                <div className="flex flex-col w-1/2">
                  <label
                    htmlFor="tokenMint"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Treasury SPL Token Address
                  </label>
                  <input
                    value={formData.tokenMint}
                    type="text"
                    id="tokenMint"
                    name="tokenMint"
                    onChange={handleFormChange}
                    placeholder="SPL Token Mint Address"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  />
                </div>

                <div className="flex flex-col w-1/2">
                  <label
                    htmlFor="decimals"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Treasury Token Decimals
                  </label>
                  <input
                    value={formData.decimals}
                    type="number"
                    id="decimals"
                    name="decimals"
                    onChange={handleFormChange}
                    placeholder="SPL Token Decimals"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  />
                </div>
              </div>

              <div className="flex flex-row justify-between gap-4 items-end">
                {/* <div className="flex flex-col w-1/2">
                  <label
                    htmlFor="initialDeposit"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Initial Treasury Deposit (SPL)
                  </label>
                  <input
                    value={formData.initialDeposit}
                    type="number"
                    id="initialDeposit"
                    name="initialDeposit"
                    onChange={handleFormChange}
                    placeholder="Amount to fund the treasury"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  />
                </div> */}

                <div className="flex flex-col w-full">
                  <label
                    htmlFor="minYesVotes"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Minimum Yes Votes (For proposals to pass)
                  </label>
                  <input
                    value={formData.minYesVotes}
                    type="number"
                    id="minYesVotes"
                    name="minYesVotes"
                    onChange={handleFormChange}
                    placeholder="Min. yes Votes required to pass a proposal"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  />
                </div>
              </div>

              <div className="flex flex-row justify-between gap-4 items-end">
                <div className="flex flex-col w-1/2">
                  <label
                    htmlFor="proposalCreationFee"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Proposal Creation Fee (Treasury SPL)
                  </label>
                  <input
                    value={formData.proposalCreationFee}
                    type="number"
                    id="proposalCreationFee"
                    name="proposalCreationFee"
                    onChange={handleFormChange}
                    placeholder="Tokens to create a proposal"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  />
                </div>

                <div className="flex flex-col w-1/2">
                  <label
                    htmlFor="membershipFee"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Membership Fee (Treasury SPL)
                  </label>
                  <input
                    value={formData.membershipFee}
                    type="number"
                    id="membershipFee"
                    name="membershipFee"
                    onChange={handleFormChange}
                    placeholder="Fee required to join the DAO"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className={`bg-offBlack ${
                  wallet.publicKey ? "" : "disabled"
                } hover:bg-offBlackHover h-full w-full font-normal transition duration-300 ease-in-out text-offWhite  hover:accent-accentHover p-4`}
              >
                {wallet.publicKey ? "Create DAO" : "Connect Wallet"}
              </button>
            </form>
          </>
        )}

        {loading && <>{loadingSpinner()}</>}
      </div>
    </div>
  );
};

export default CreateDAO;
