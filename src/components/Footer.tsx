import React from "react";
import { useNavigate } from "react-router-dom";
import GreekCourt from "../assets/greek_court.png";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <footer
        className="bg-offBlack text-offWhite relative"
        style={{
          backgroundImage: `url(${GreekCourt})`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        {/* overlay div */}
        <div className="absolute bottom-0 left-0 w-full h-full bg-black opacity-85 "></div>

        <div className="relative p-8 md:py-16 md:px-16">
          <div className="flex  md:justify-start md:items-start flex-wrap">
            <div className="flex flex-col justify-start items-start w-1/4 mb-4 mr-4 md:mr-0">
              <h2 className="text-gray-400 text-xl font-bold mb-4">Links</h2>

              <ul className="list-none">
                <li className="mb-2">
                  <span
                    onClick={() => navigate("/")}
                    className="text-offWhite hover:text-gray-400 cursor-pointer"
                  >
                    Home
                  </span>
                </li>

                <li className="mb-2">
                  <span
                    onClick={() => navigate("/daos")}
                    className="text-offWhite hover:text-gray-400 cursor-pointer"
                  >
                    DAOs
                  </span>
                </li>

                <li className="mb-2">
                  <span
                    onClick={() => navigate("/create-dao")}
                    className="text-offWhite hover:text-gray-400 cursor-pointer"
                  >
                    Create DAO
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col justify-start items-start w-1/4">
              <h2 className="text-gray-400 text-xl font-bold mb-4">Socials</h2>

              <ul className="list-none">
                <li className="mb-2">
                  <a
                    href="https://twitter.com/QuadratusDAO"
                    className="text-offWhite hover:text-gray-400"
                  >
                    Twitter
                  </a>
                </li>

                <li className="mb-2">
                  <a
                    href="https://github.com/QuadratusDAO"
                    className="text-offWhite hover:text-gray-400"
                  >
                    Github
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
