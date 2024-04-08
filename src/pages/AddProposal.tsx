import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useWalletStore, useDaoStore } from "../store";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, BN } from "@project-serum/anchor";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import idl from "../idl.json";
import {
  getProvider,
  parseLargeNumbers,
  loadingSpinner,
} from "../utils/helpers";
import { toast } from "react-toastify";

const AddProposal: React.FC = () => {
  const navigate = useNavigate();

  const dao = useDaoStore();

  const wallet = useWalletStore();
  const parsedIdl = JSON.parse(JSON.stringify(idl));
  const programID = new PublicKey(idl.metadata.address);

  const [loading, setLoading] = React.useState(true);
  const [isBurn, setIsBurn] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    amount: "",
    endDate: "",
    burnOnVote: true,
    action: "transfer",
    recipient: "",
  });

  const handleFormChange = (e: any) => {
    if (e.target.name === "action") {
      if (e.target.value === "burn") {
        setIsBurn(true);
      } else {
        setIsBurn(false);
      }
    }

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

      if (!formData.title || !formData.description) {
        toast.error("Please fill all required fields.");
        return;
      }

      if (!formData.amount || !formData.endDate) {
        toast.error("Please fill all required fields.");
        return;
      }

      if (Number(formData.amount) <= 0) {
        toast.error("Please enter a valid amount.");
        return;
      }

      if (new Date(formData.endDate).getTime() < Date.now()) {
        toast.error("Please enter a valid end date.");
        return;
      }

      setLoading(true);

      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      const userTokenMintAccount = await getAssociatedTokenAddress(
        dao.tokenMint.address,
        new PublicKey(wallet.publicKey.toString())
      );

      if (!formData.recipient) {
        formData.recipient = wallet.publicKey.toString();
      }

      const recipientTokenMintAccount = await getAssociatedTokenAddress(
        dao.tokenMint.address,
        new PublicKey(formData.recipient)
      );

      const daoPDA = new PublicKey(dao.id);

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
        programID
      );

      const [proposalPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          daoPDA.toBuffer(),
          new BN(Number(dao.totalProposals)).toBuffer("le", 8),
        ],
        programID
      );

      //   get date in seconds not milliseconds
      const endDate = new Date(formData.endDate).getTime() / 1000;

      await program.methods
        .createProposal(
          new BN(formData.amount * 1000000),
          new BN(endDate),
          formData.title,
          formData.description,
          formData.action === "burn" ? 0 : 1,
          formData.burnOnVote
        )
        .accounts({
          dao: daoPDA,
          proposal: proposalPDA,
          treasuryVault: treasuryPDA,
          beneficiary: recipientTokenMintAccount,
          beneficiaryOwner: new PublicKey(formData.recipient),
          user: wallet.publicKey,
          membership: membershipPDA,
          tokenMint: dao.tokenMint.address,
          userTokenMintAccount: userTokenMintAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
        .then(async () => {
          setTimeout(() => {
            navigate(`/dao/${dao.id}`);
            setLoading(false);
          }, 500);
        })
        .catch((e) => {
          console.log(e);
          toast.error("Failed to create proposal.");
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!wallet.publicKey) {
      navigate("/");
    }

    if (dao.id) {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [dao.id, wallet.publicKey]);

  return (
    <div className="flex items-center justify-center w-full h-fit min-h-[600px]">
      <div className="flex mt-8 flex-col h-fit gap-4  mb-8 w-full md:px-16 px-8 justify-center items-center ">
        {dao && !loading && (
          <>
            {/* heading */}
            <div className="flex flex-col gap-4 items-start justify-start w-1/2 mb-4">
              <div className="flex flex-col  items-start justify-start w-full">
                <h1 className="text-4xl font-bold text-center">
                  Create Proposal
                </h1>
                <p className="text-lg text-start">
                  Create a new proposal to be voted on by the community.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:w-1/2">
              <h1 className="text-2xl font-bold">DAO: {dao.name}</h1>

              <div className="flex items-center  justify-center gap-2">
                <h1 className="text-lg font-bold">Proposal Creation Fee: </h1>

                <p className=" text-md">
                  {parseLargeNumbers(dao.proposalCreationFee, 6)}{" "}
                  {dao.tokenTicker}
                </p>
              </div>
            </div>

            <form className="flex flex-col gap-4 w-full md:w-1/2">
              <div className="flex flex-col">
                <label
                  htmlFor="title"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="description"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  placeholder="Make a persuasive argument for your proposal."
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={5}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="amount"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Token Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  placeholder="Deducted from the treasury if proposal passes."
                  value={formData.amount}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="action"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Action to take if proposal passes
                </label>
                <div className="flex flex-row gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="transfer"
                      name="action"
                      value="transfer"
                      className="mr-2"
                      onChange={handleFormChange}
                      defaultChecked
                    />
                    <label htmlFor="transfer">Transfer</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="burn"
                      name="action"
                      value="burn"
                      className="mr-2"
                      onChange={handleFormChange}
                    />
                    <label htmlFor="burn">Burn</label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="burnOnVote"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Burn the tokens used to vote
                </label>
                <div className="flex flex-row gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="yes"
                      name="burnOnVote"
                      value="yes"
                      className="mr-2"
                    />
                    <label htmlFor="yes">Yes</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="no"
                      name="burnOnVote"
                      value="no"
                      className="mr-2"
                      defaultChecked
                    />
                    <label htmlFor="no">No</label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="endDate"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  End Date
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  placeholder="Date"
                  value={formData.endDate}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="recipient"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Recipient Address (optional)
                </label>
                <input
                  disabled={isBurn}
                  type="text"
                  id="recipient"
                  name="recipient"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-black focus:shadow-outline"
                  placeholder="Enter recipient address"
                  value={formData.recipient}
                  onChange={handleFormChange}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="bg-offBlack hover:bg-offBlackHover h-full w-full font-normal transition duration-300 ease-in-out text-offWhite  hover:accent-accentHover p-4"
              >
                Create Proposal
              </button>
            </form>
          </>
        )}

        {!dao || (loading && <>{loadingSpinner()}</>)}
      </div>
    </div>
  );
};

export default AddProposal;
