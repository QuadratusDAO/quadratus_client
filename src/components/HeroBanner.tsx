import { useNavigate } from "react-router-dom";

import gavel from "../assets/gavel.png";

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <>
      <div className="gap-16 md:gap-8 flex flex-col md:flex-row justify-between w-full h-auto bg-cover bg-center bg-no-repeat py-16 px-8 md:px-16 ">
        {/* Left Banner */}
        <div className="flex flex-col w-full md:items-start md:justify-center md:w-2/3 h-full  bg-cover bg-center bg-no-repeat gap-16">
          <h1 className="flex font-medium flex-col gap-4 text-3xl md:text-7xl w-full text-center  md:text-start text-black">
            <span>Quadratic</span>
            <span>Voting &</span>
            <span>DAO Protocol</span>
          </h1>

          <div className="flex flex-col w-full">
            <h5 className="text-xl text-center md:text-start text-black">
              Quadratic voting is a governance model that fosters more equitable
              DAO proposal outcomes by increasing the cost of each vote a user
              makes on a given proposal quadratically (n²).
              <br />
              <br />
              This model is designed to give more weight to the degree of a
              voters preference rather than just the direction of their
              preference.
            </h5>

            <button
              onClick={() => navigate("/daos")}
              className="font-inter flex items-center justify-center md:w-fit h-fit px-8 py-2 mt-8 text-xl font-semibold text-white transition duration-300 ease-in-out bg-offBlack rounded-lg hover:bg-offBlackHover"
            >
              Launch App
            </button>
          </div>
        </div>

        {/* Right Banner */}
        <div className="flex flex-col items-center justify-center md:w-fit h-auto bg-cover bg-center bg-no-repeat gap-16 p-4">
          <img src={gavel} alt="" className="" />
        </div>
      </div>
    </>
  );
}
