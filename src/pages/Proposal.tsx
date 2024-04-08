import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWalletStore, useProposalStore, useDaoStore } from "../store";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import idl from "../idl.json";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { EyeIcon } from "@heroicons/react/24/outline";
import {
  getProvider,
  parseEndDateCountdown,
  parseMinYesVotes,
  parseLargeNumbers,
  parseAddress,
  handleClickAddress,
  loadingSpinner,
} from "../utils/helpers";
import VoteButton from "../components/VoteButton";

const Proposal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dao: any = useDaoStore();
  const proposal: any = useProposalStore();

  const wallet = useWalletStore();
  const parsedIdl = JSON.parse(JSON.stringify(idl));
  const programID = new PublicKey(idl.metadata.address);

  const [loading, setLoading] = useState<boolean>(true);
  const [amount, setAmount] = useState(0);

  const handleAmount = async (e: any) => {
    setAmount(e.target.value);
  };

  const fetchProposal = async () => {
    try {
      if (proposal.id) {
        console.log("proposal already exists");
        setTimeout(() => {
          setLoading(false);
        }, 500);
        return;
      }

      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      const getProposal: any = await program.account.proposal.fetch(
        new PublicKey(location.pathname.split("/")[2])
      );

      let proposalData: any = {
        id: location.pathname.split("/")[2],
        creator: getProposal.creator.toString(),
        dao: getProposal.dao.toString(),
        title: getProposal.title,
        description: getProposal.description,
        beneficiary: getProposal.beneficiary.toString(),
        tokenAmount: getProposal.tokenAmount.toNumber(),
        action: getProposal.action,
        burnOnVote: getProposal.burnOnVote,
        yesVotes: getProposal.yesVotes.toNumber(),
        noVotes: getProposal.noVotes.toNumber(),
        endDate: getProposal.endDate,
        status: getProposal.status,
        executed: getProposal.executed,
      };

      proposal.setProposal(proposalData);

      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!dao.id) navigate("/daos");

    fetchProposal();
  }, []);

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center w-full bg-backgroundColor h-fit min-h-[600px]">
          {loadingSpinner()}
        </div>
      )}

      {!loading && (
        <>
          {/* wrapper */}
          <div className="flex items-center justify-center w-full bg-backgroundColor h-fit">
            <div className="flex flex-col md:flex-row h-fit gap-4 mt-8 mb-8 w-full md:px-16 px-8">
              {/* left screen */}
              <div className="flex flex-col md:w-2/3 h-full bg-offWhite rounded-md p-4 gap-4 border border-borderColor shadow-md">
                {/* back nav */}
                <div
                  onClick={() => navigate(`/dao/${proposal?.dao?.toString()}`)}
                  className="flex items-center justify-start cursor-pointer w-fit hover:text-offBlackHover"
                >
                  <span className="flex font-thin flex-row text-md underline underline-offset-4 gap-2 items-center font-inter">
                    <ArrowLeftIcon className="w-4 h-4" />
                    {dao.name}
                  </span>
                </div>

                {/* header */}
                <div className="flex flex-col items-start justify-start w-full h-fit border  border-borderColor rounded-md ">
                  <div className="flex flex-col items-start justify-start gap-4 w-full h-full p-4">
                    <div className="flex flex-row items-end w-full gap-4">
                      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-black">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={dao?.image}
                          alt="dao"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      {dao.name && (
                        <h1 className="text-2xl">
                          Proposal: {proposal?.title}
                        </h1>
                      )}
                    </div>

                    <div className="flex flex-col items-start justify-start gap-4">
                      <span className="text-sm">{proposal?.description}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* right screen */}
              <div className="flex flex-col md:w-1/3 md:h-full bg-offWhite rounded-md p-4 border border-borderColor shadow-md gap-8">
                {/* Details */}
                <div className="flex flex-col items-start justify-start h-full w-full ">
                  <h1 className="text-2xl font-bold">Details</h1>

                  <div className="flex flex-col items-start justify-start w-full h-fit border border-borderColor rounded-md p-4 gap-4">
                    <div className="flex flex-row items-center justify-between w-full gap-4  flex-wrap">
                      <span className="text-sm">Creator: </span>

                      {proposal.creator && (
                        <div
                          className="flex flex-row text-sm cursor-pointer hover:text-offBlackHover"
                          onClick={() =>
                            handleClickAddress(
                              proposal.creator?.toString() || ""
                            )
                          }
                        >
                          {parseAddress(proposal.creator?.toString())}

                          <EyeIcon className="w-4 h-4 ml-2 cursor-pointer" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4 flex-wrap">
                      <span className="text-sm">Recipient: </span>

                      {proposal.beneficiary && (
                        <div
                          className="flex flex-row text-sm cursor-pointer hover:text-offBlackHover"
                          onClick={() =>
                            handleClickAddress(
                              proposal.beneficiary?.toString() || ""
                            )
                          }
                        >
                          {parseAddress(proposal.beneficiary?.toString())}

                          <EyeIcon className="w-4 h-4 ml-2 cursor-pointer" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4 flex-wrap">
                      <span className="text-sm">Treasury: </span>

                      {proposal.beneficiary && (
                        <div
                          className="flex flex-row text-sm cursor-pointer hover:text-offBlackHover"
                          onClick={() =>
                            handleClickAddress(
                              dao.treasuryVault?.toString() || ""
                            )
                          }
                        >
                          {parseAddress(dao.treasuryVault?.toString() || "")}
                          <EyeIcon className="w-4 h-4 ml-2 cursor-pointer" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4">
                      <span className="text-sm">Requested Amount: </span>

                      <span className="text-sm">
                        {parseLargeNumbers(
                          proposal.tokenAmount,
                          dao?.tokenMint?.decimals
                        )}{" "}
                        {dao.tokenTicker}
                      </span>
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4">
                      <span className="text-sm">Proposal Action: </span>

                      <span className="text-sm">
                        {proposal?.action === 0 ? "Burn" : "Transfer"}
                      </span>
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4">
                      <span className="text-sm">Votes Burned: </span>

                      <span className="text-sm">
                        {proposal.burnOnVote ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start justify-start h-full w-full">
                  <h1 className="text-2xl font-bold">Current results</h1>

                  <div className="flex flex-col items-start justify-start w-full h-fit border border-borderColor rounded-md p-4 gap-4">
                    {/* two part progress bar with yes and no votes */}
                    <div className="flex flex-col items-start justify-start w-full h-fit gap-4">
                      <div className="flex flex-row items-center justify-between w-full gap-4">
                        <span className="text-sm">Yes Votes: </span>

                        <span className="text-sm">
                          {parseLargeNumbers(proposal?.yesVotes, 0)}
                        </span>
                      </div>

                      <div className="flex flex-row items-center justify-between w-full gap-4">
                        <span className="text-sm">No Votes: </span>

                        <span className="text-sm">
                          {parseLargeNumbers(proposal?.noVotes, 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start justify-start w-full h-fit gap-4">
                      <div className="flex flex-col items-start justify-start w-full h-fit gap-4">
                        <div className="flex flex-row items-center justify-between w-full gap-4">
                          <span className="text-sm">
                            Min. Yes Votes Reached:
                          </span>

                          <div className="flex items-end justify-end ">
                            <span className="flex text-sm ">
                              {parseMinYesVotes(
                                proposal?.yesVotes,
                                dao?.minYesVotes
                              )?.bool
                                ? "Yes"
                                : "No"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-between w-full gap-4">
                          <span className="text-sm">Ends in: </span>

                          <span className="text-sm">
                            {parseEndDateCountdown(proposal?.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* vote button */}
                <div className="flex flex-col items-start justify-start h-full w-full gap-4">
                  <h1 className="text-2xl font-bold">Cast Votes</h1>

                  {dao?.isMember && (
                    <div className="flex flex-col items-start justify-start w-full h-fit gap-4">
                      <span className="text-sm">Amount: </span>

                      <input
                        value={amount}
                        onChange={handleAmount}
                        type="number"
                        className="w-[200px] p-2 border border-borderColor rounded-md focus:outline-black focus:shadow-outline"
                      />
                    </div>
                  )}

                  <div className="flex flex-row w-full gap-4 border border-borderColor rounded-md p-4">
                    {dao?.isMember ? (
                      <VoteButton amount={amount} />
                    ) : (
                      <div className="flex flex-row items-center justify-center w-full gap-4">
                        <span className="text-sm">
                          Join DAO to vote on proposals.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Proposal;
