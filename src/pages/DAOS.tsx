import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import idl from "../idl.json";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { getProvider, loadingSpinner } from "../utils/helpers";

const DAOS: React.FC = () => {
  const navigate = useNavigate();

  const wallet = useWalletStore();
  const parsedIdl = JSON.parse(JSON.stringify(idl));
  const programID = new PublicKey(idl.metadata.address);

  const [daos, setDaos] = React.useState<any>();
  const [loading, setLoading] = React.useState<boolean>(true);

  const elipsisLongNames = (name: string) => {
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

  // const elipsisLongBio = (bio: string) => {
  //   try {
  //     if (bio.length > 80) {
  //       return bio.slice(0, 80) + "...";
  //     } else {
  //       return bio;
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  const getRecentDaos = async () => {
    try {
      const provider = getProvider(wallet);
      const program = new Program(parsedIdl, programID, provider);

      let daos = await program.account.dao.all();

      // sort daos by total proposals in descending order
      daos = daos.sort((a: any, b: any) => {
        return b.totalProposals - a.totalProposals;
      });

      setDaos(daos);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    getRecentDaos();
  }, []);

  useEffect(() => {
    if (daos) {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [daos]);

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center w-full bg-backgroundColor h-fit min-h-[600px]">
          {loadingSpinner()}
        </div>
      )}

      {!loading && (
        <>
          <div className="font-specialElite flex flex-col items-center ">
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 mt-10 px-8 md:px-16 ">
              <div className="flex items-start justify-start w-full">
                <h1 className="text-3xl font-bold">DAOs</h1>
              </div>

              <div className="flex items-start justify-end gap-4 w-full flex-col md:flex-row">
                <div>
                  <input
                    type="text"
                    placeholder="Search"
                    className="font-inter w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-offBlack"
                  />
                </div>

                <button className="font-inter flex gap-2 bg-offBlack items-center justify-center  hover:bg-offBlackHover text-white rounded-md p-2">
                  <PlusCircleIcon className="h-6 w-6" />
                  Create DAO
                </button>
              </div>
            </div>

            <div className="font-inter grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-8 w-full px-8 md:px-16">
              {daos && (
                <>
                  {daos.map((dao: any) => (
                    <div
                      key={dao.publicKey.toString()}
                      onClick={() =>
                        navigate(`/dao/${dao.publicKey.toString()}`)
                      }
                      className=" max-h-[300px] bg-offGray rounded-lg p-8 min-h-[300px] border border-borderColor  shadow-md cursor-pointer   hover:bg-offWhite hover:shadow-md transition duration-400 ease-in-out"
                    >
                      <div className="flex flex-col justify-between h-full">
                        <div className="rounded-md mb-4">
                          <div className="flex flex-col items-start gap-4">
                            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-black">
                              <img
                                className="w-10 h-10"
                                src={dao?.account.image}
                                alt=""
                              />
                            </div>

                            <h1 className="font-specialElite text-2xl font-bold">
                              {elipsisLongNames(dao?.account.name)}
                            </h1>
                          </div>
                        </div>

                        {/* 
                  <div className="flex rounded-md py-4 flex-grow mb-4">
                    <div className="flex justify-between items-start">
                      <span className="text-md text-offBlack rounded-md">
                        {elipsisLongBio(dao?.account.bio)}
                      </span>
                    </div>
                  </div> */}

                        <div className="flex justify-between gap-4 rounded-md py-4 flex-wrap">
                          {/* <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Membership:</span>

                      <span className="text-sm font-bold">
                        {dao?.account.admins?.length}
                      </span>
                    </div> */}

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              Total Proposals:
                            </span>

                            <span className="text-sm font-bold">
                              {Number(dao?.account?.totalProposals)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {!daos ||
              (daos.length < 1 && (
                <div className="font-specialElite flex justify-center items-center h-fit min-h-[300px] mb-20 w-full ">
                  <h1 className="text-offBlack text-2xl font-bold">
                    No DAOs found...
                  </h1>
                </div>
              ))}
          </div>
        </>
      )}
    </>
  );
};

export default DAOS;
