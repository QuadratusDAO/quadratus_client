import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWalletStore, useDaoStore } from "../store";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import {
  getMint,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import idl from "../idl.json";
import { PlusCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import {
  getProvider,
  getTokenMetadata,
  elipsisLongNames,
  parseProposalStatus,
  parseEndDateCountdown,
  parseMinYesVotes,
  parseLargeNumbers,
  loadingSpinner,
  parseAddress,
  handleClickAddress,
} from "../utils/helpers";
import JoinDAOButton from "../components/JoinDAOButton";

const DAO: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const wallet = useWalletStore();
  const parsedIdl = JSON.parse(JSON.stringify(idl));
  const programID = new PublicKey(idl.metadata.address);

  const dao = useDaoStore();
  const daoId = location.pathname.split("/")[2];

  const [loading, setLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);

  const handleAddProposal = () => {
    let dao = location.pathname.split("/")[2];
    navigate(`/add-proposal/${dao}`);
  };

  const handleProposalClick = (id: string) => {
    navigate(`/proposal/${id}`);
  };

  const fetchDAO = async () => {
    try {
      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      const daoAccount: any = await program.account.dao.fetch(
        new PublicKey(location.pathname.split("/")[2])
      );

      const tokenAccountInfo = await getAccount(
        program.provider.connection,
        daoAccount.treasuryVault
      );

      const burnTokenAccountInfo = await getAccount(
        program.provider.connection,
        daoAccount.burnVault
      );

      const mint = await getMint(
        program.provider.connection,
        tokenAccountInfo.mint
      );

      //   get all the proposals for this DAO
      let proposals = await program.account.proposal.all([
        {
          memcmp: {
            offset: 72, // Offset of the `dao` field
            bytes: new PublicKey(daoId).toBase58(),
          },
        },
      ]);

      // get all the members for this DAO
      let members = await program.account.membership.all([
        {
          memcmp: {
            offset: 8, // Offset of the `dao` field
            bytes: new PublicKey(daoId).toBase58(),
          },
        },
      ]);

      proposals.sort((a: any, b: any) => {
        return b.account.endDate.toNumber() - a.account.endDate.toNumber();
      });

      const symbol: any = await getTokenMetadata(mint?.address.toString());

      let daoData: any = {
        id: daoId,
        name: daoAccount.name,
        image: daoAccount.image,
        treasuryVault: daoAccount.treasuryVault,
        burnVault: daoAccount.burnVault,
        burnedVault: burnTokenAccountInfo,
        totalProposals: Number(daoAccount.totalProposals),
        treasury: tokenAccountInfo,
        tokenMint: mint,
        tokenTicker: symbol,
        proposalsList: proposals,
        membersList: members,
        minYesVotes: Number(daoAccount.minYesVotes),
        proposalCreationFee: Number(daoAccount.proposalCreationFee),
        membershipFee: Number(daoAccount.membershipFee),
      };

      dao.setDAO(daoData);

      if (mint) {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const checkIfMember = async () => {
    try {
      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      if (wallet.publicKey) {
        let membershipPDA;
        let isMember;

        [membershipPDA] = await PublicKey.findProgramAddress(
          [
            Buffer.from("membership"),
            new PublicKey(daoId).toBuffer(),
            new PublicKey(wallet.publicKey).toBuffer(),
          ],
          programID
        );

        isMember = await program.provider.connection.getAccountInfo(
          membershipPDA
        );

        dao.setDAO({
          ...dao,
          isMember: isMember ? true : false,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getUserTokenBalance = async () => {
    try {
      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      if (!dao.tokenMint) return;

      const userTokenATA = await getAssociatedTokenAddress(
        dao.tokenMint.address,
        new PublicKey("d4JmjH2es6fY6znhHiL34fva6VibbJFT6ym6tLR13Pk")
      );

      if (!userTokenATA) {
        setBalance(0);
        return;
      }

      const tokenBalance =
        await program.provider.connection.getTokenAccountBalance(userTokenATA);

      const balance = tokenBalance?.value?.uiAmount || 0;

      setBalance(balance);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!wallet.publicKey) return;

    checkIfMember();
  }, [wallet.publicKey]);

  useEffect(() => {
    if (!wallet.publicKey) return;

    getUserTokenBalance();
  }, [dao.tokenMint, wallet.publicKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDAO();
  }, []);

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center w-full bg-backgroundColor h-fit min-h-[600px]">
          {loadingSpinner()}
        </div>
      )}

      {dao && !loading && (
        <>
          <div className="flex items-start justify-center w-full bg-backgroundColor h-fit min-h-[800px]">
            <div className="flex flex-col md:flex-row h-fit gap-4 mt-8 mb-8 w-full md:px-16 px-8">
              {/* left screen */}
              <div className="flex flex-col md:w-2/3 h-full bg-offWhite rounded-md p-4 gap-4 border border-borderColor shadow-md">
                <div
                  onClick={() => navigate(`/daos`)}
                  className="flex items-center justify-start cursor-pointer w-fit hover:text-offBlackHover"
                >
                  <span className="flex font-thin flex-row text-md underline underline-offset-4 gap-2 items-center font-inter">
                    <ArrowLeftIcon className="w-4 h-4" />
                    View All DAOs
                  </span>
                </div>
                {/* header */}
                <div className="flex flex-col items-start justify-start w-full h-fit border  border-borderColor rounded-md ">
                  <div className="flex flex-col items-start justify-start gap-4 w-full h-full p-4">
                    <div className="flex flex-col md:flex-row md:items-end w-full gap-4">
                      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-black">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={dao?.image}
                          alt="dao"
                        />
                      </div>

                      <div className="flex items-start justify-start">
                        {dao.name && (
                          <h1 className="md:text-4xl">
                            {elipsisLongNames(dao?.name)}
                          </h1>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start justify-start gap-2 w-full">
                      <div className="flex flex-row items-center justify-between w-full gap-4">
                        <span className="text-sm">Proposals:</span>
                        <span className="text-sm">{dao.totalProposals}</span>
                      </div>

                      <div className="flex flex-row items-center justify-between w-full gap-4">
                        <span className="text-sm">Members:</span>
                        <span className="text-sm">
                          {dao.membersList.length}
                        </span>
                      </div>

                      <div className="flex flex-row items-center justify-between w-full gap-4">
                        <span className="text-sm">DAO Membership Fee:</span>
                        <span className="text-sm">
                          {parseLargeNumbers(
                            dao.membershipFee,
                            dao.tokenMint.decimals
                          )}{" "}
                          {dao.tokenTicker}
                        </span>
                      </div>

                      <div className="flex flex-row items-center justify-between w-full gap-4">
                        <span className="text-sm">Proposal Creation Fee:</span>
                        <span className="text-sm">
                          {parseLargeNumbers(
                            dao.proposalCreationFee,
                            dao.tokenMint.decimals
                          )}{" "}
                          {dao.tokenTicker}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* body */}
                <div className="font-specialElite flex flex-col items-start justify-start w-full h-fit">
                  <div className="flex flex-col items-start justify-start gap-4  w-full h-full">
                    <div className="flex w-full items-center justify-between ">
                      <div>
                        <h1 className="text-2xl font-bold">Proposals</h1>
                      </div>

                      <div className="flex flex-row items-center justify-between gap-4">
                        {!dao.isMember && (
                          <>
                            <JoinDAOButton />
                          </>
                        )}

                        {/* new proposal button */}
                        <div className="flex flex-row gap-4">
                          <button
                            onClick={() => handleAddProposal()}
                            className={`font-inter ${
                              !wallet.publicKey || !dao.isMember
                                ? "disabled"
                                : ""
                            } flex gap-2 bg-offBlack items-center  hover:bg-offBlackHover text-white rounded-md p-2`}
                          >
                            <PlusCircleIcon className="h-6 w-6" />
                            New Proposal
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Proposal Section */}
                    <div className="cursor-pointer flex flex-col items-start justify-start gap-4 bg-offWhite rounded-md text-offBlack w-full">
                      {/* Proposals */}
                      {dao.proposalsList.map((proposal: any) => (
                        <div
                          onClick={() =>
                            handleProposalClick(proposal.publicKey.toString())
                          }
                          key={proposal.publicKey.toString()}
                          className="flex flex-col border border-borderColor rounded-md w-full hover:bg-offGray transition duration-300 ease-in-out min-h-fit"
                        >
                          {/* top half */}
                          <div className="flex flex-col items-start justify-start w-full p-4 rounded-md h-1/2 gap-4">
                            <div>
                              <h1 className="text-xl font-bold">
                                {proposal.account.title}
                              </h1>
                            </div>

                            {/* Status */}
                            <div className="flex flex-row items-center justify-between w-full gap-4">
                              <span className="text-sm">Status:</span>
                              <span className="text-sm">
                                {parseProposalStatus(proposal.account)}
                              </span>
                            </div>

                            {/* token amount */}
                            <div className="flex flex-row items-center justify-between w-full gap-4">
                              <span className="text-sm">Amount:</span>
                              <div className="flex gap-2">
                                <span className="text-sm">
                                  {proposal.account.tokenAmount.toNumber() /
                                    Math.pow(10, dao.tokenMint.decimals)}
                                </span>

                                <span className="text-sm">
                                  {dao.tokenTicker}
                                </span>
                              </div>
                            </div>

                            {/* End date */}
                            <div className="flex flex-row items-center justify-between w-full gap-4">
                              <span className="text-sm">End Date:</span>
                              <span className="text-sm">
                                {parseEndDateCountdown(
                                  proposal.account.endDate.toNumber()
                                )}
                              </span>
                            </div>
                          </div>

                          {/* bottom half */}
                          <div className="font-inter flex flex-col md:flex-row items-center md:items-center w-full p-4 border-t border-borderColor gap-4 ">
                            {/* Left Half */}
                            <div className=" flex flex-col items-start justify-between gap-4 w-full md:w-1/2 h-fit ">
                              <div className="flex flex-row items-start justify-between gap-4 w-full md:w-full h-fit">
                                <div className="flex flex-col items-start justify-between w-full">
                                  <span className="text-sm">Yes Votes</span>

                                  <div className="flex flex-row  justify-between gap-2">
                                    <span className="text-xs font-bold">
                                      {proposal.account.yesVotes.toNumber()}
                                    </span>

                                    <span className="text-xs">
                                      {proposal.account.yesVotes.toNumber() ===
                                      0 ? (
                                        <>
                                          <span>0%</span>
                                        </>
                                      ) : (
                                        <>
                                          {(
                                            (proposal.account.yesVotes.toNumber() /
                                              (proposal.account.yesVotes.toNumber() +
                                                proposal.account.noVotes.toNumber())) *
                                            100
                                          ).toFixed(1)}
                                          %
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end justify-between w-full ">
                                  <span className="text-sm">No Votes</span>

                                  <div className="flex flex-row items-end justify-start gap-1">
                                    <span className="text-xs font-bold">
                                      {proposal.account.noVotes.toNumber()}
                                    </span>

                                    <span className="text-xs">
                                      {proposal.account.noVotes.toNumber() ===
                                      0 ? (
                                        <>
                                          <span>0%</span>
                                        </>
                                      ) : (
                                        <>
                                          {(
                                            (proposal.account.noVotes.toNumber() /
                                              (proposal.account.yesVotes.toNumber() +
                                                proposal.account.noVotes.toNumber())) *
                                            100
                                          ).toFixed(1)}
                                          %
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="w-full h-2 rounded-md border border-borderColor bg-red-500">
                                <div
                                  className="h-full bg-green-500 rounded-md"
                                  style={{
                                    width:
                                      (
                                        (proposal.account.yesVotes.toNumber() /
                                          (proposal.account.yesVotes.toNumber() +
                                            proposal.account.noVotes.toNumber())) *
                                        100
                                      ).toFixed(2) + "%",
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* vertical line */}
                            <div className="flex md:h-20 border-r border-borderColor"></div>

                            {/* Right half */}
                            <div className=" flex flex-col items-start justify-between gap-4 w-full md:w-1/2 h-fit ">
                              <div className="flex flex-col items-start justify-between gap-4 w-full md:w-full h-fit">
                                <div>
                                  <div className="flex text-sm gap-2">
                                    Minimum Yes Votes:
                                    <span className="font-bold">
                                      {dao.minYesVotes}
                                    </span>
                                  </div>

                                  <div className="flex flex-row items-end justify-start gap-1">
                                    <span className="text-xs">
                                      {
                                        parseMinYesVotes(
                                          proposal.account.yesVotes.toNumber(),
                                          dao.minYesVotes
                                        )?.message
                                      }
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full h-2 rounded-md border border-borderColor">
                                  <div
                                    className="h-full bg-purple-400 rounded-md"
                                    style={{
                                      width: `${
                                        parseMinYesVotes(
                                          proposal.account.yesVotes.toNumber(),
                                          dao.minYesVotes
                                        )?.percentage
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* right screen */}
              <div className="flex flex-col gap-8 md:w-1/3 md:h-full bg-offWhite rounded-md p-4 border border-borderColor shadow-md">
                <div className="flex flex-col gap-2 items-start justify-start h-full w-full">
                  <h1 className="text-2xl font-bold">Account</h1>

                  <div className="flex flex-col items-start justify-start w-full h-fit border border-borderColor rounded-md p-4 gap-4">
                    <div className="flex flex-row items-center justify-between w-full gap-4">
                      <span className="text-sm">Balance: </span>

                      <span className="text-sm">
                        {parseLargeNumbers(balance, dao.tokenMint.decimals)}{" "}
                        {dao.tokenTicker}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-start justify-start h-full w-full">
                  <h1 className="text-2xl font-bold">Treasury</h1>

                  <div className="flex flex-col items-start justify-start w-full h-fit border border-borderColor rounded-md p-4 gap-4">
                    <div className="flex flex-row items-center justify-between w-full gap-4">
                      <span className="text-sm">Balance: </span>

                      <span className="text-sm">
                        {parseLargeNumbers(
                          dao.treasury.amount,
                          dao.tokenMint.decimals
                        )}{" "}
                        {dao.tokenTicker}
                      </span>
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4">
                      <span className="text-sm">Burned: </span>

                      <span className="text-sm">
                        {parseLargeNumbers(
                          dao.burnedVault?.amount,
                          dao.tokenMint.decimals
                        )}{" "}
                        {dao.tokenTicker}
                      </span>
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4">
                      <span className="text-sm">Total Supply:</span>
                      <span className="flex gap-2 text-sm">
                        {parseLargeNumbers(
                          dao.tokenMint.supply,
                          dao.tokenMint.decimals
                        )}

                        <span>{dao.tokenTicker}</span>
                      </span>
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4">
                      <span className="text-sm">Token Mint:</span>

                      <div
                        className="flex flex-row text-sm cursor-pointer hover:text-offBlackHover underline underline-offset-4"
                        onClick={() =>
                          handleClickAddress(dao.tokenMint.address)
                        }
                      >
                        {parseAddress(dao.tokenMint.address)}
                      </div>
                    </div>
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

export default DAO;
