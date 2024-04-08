import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { IoIosCloseCircleOutline } from "react-icons/io";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("");

  const links = [
    { name: "Home", path: "/" },
    { name: "DAOs", path: "/daos" },
    { name: "Create DAO", path: "/create-dao" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []); // E

  return (
    <>
      {/* Mobile Nav */}
      <div
        className={`p-8 fixed top-0 right-0 h-screen bg-offWhite z-50  ${
          isOpen
            ? "md:w-1/2 w-full opacity-100 visible"
            : "w-0 opacity-0 invisible"
        }`}
      >
        <div className="flex flex-col justify-center items-center w-full h-full gap-8 z-10 ">
          <div onClick={() => setIsOpen(false)} className="fixed top-20 left-5">
            <IoIosCloseCircleOutline className="w-12 h-12 text-black cursor-pointer hover:text-blue-400 transition duration-300 ease-in-out gap-4 md:gap-8" />
          </div>

          <div className="font-inter flex flex-col justify-center items-start gap-8 w-full text-2xl">
            {links.map((link) => (
              <Link
                onClick={() => setIsOpen(false)}
                key={link.name}
                to={link.path}
                className={`hover:text-blue-400 transition duration-300 ease-in-out w-full  ${
                  active === link.path ? "text-blue-400" : "text-black"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex w-fit items-center justify-center h-full">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between md:h-20 w-full bg-offWhite z-100 px-8 md:px-16 border-b">
        <div className="flex justify-start items-center w-full md:w-1/3 z-10">
          <div
            onClick={() => navigate("/")}
            className="flex items-center justify-center text-3xl font-bold gap-1 cursor-pointer"
          >
            <span className="text-black font-specialElite">Quadratus</span>
          </div>
        </div>

        {/* middle nav */}
        <div className="hidden md:flex  font-specialElite items-center w-1/3 justify-center z-10">
          <div className="flex items-center justify-center gap-8">
            {links.map((link) => (
              <Link
                onClick={() => setActive(link.path)}
                key={link.name}
                to={link.path}
                className={`hover:text-gray-500 transition duration-300 ease-in-out ${
                  active === link.path ? "text-offBlackHover" : "text-black"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* right nav */}
        <div className="flex justify-end items-end md:w-1/3 p-4 md:p-0 ">
          <div className="flex items-center justify-center gap-8 md:hidden ">
            {isOpen ? (
              <></>
            ) : (
              // <IoIosCloseCircleOutline
              //   onClick={() => setIsOpen(false)}
              //   className="w-12 h-12 text-black cursor-pointer hover:text-blue-400 transition duration-300 ease-in-out gap-4 md:gap-8"
              // />
              <Bars3Icon
                onClick={() => setIsOpen(true)}
                className="w-12 h-12 text-offBlack cursor-pointer hover:text-blue-400 transition duration-300 ease-in-out gap-4 md:gap-8"
              />
            )}
          </div>

          <div className="hidden md:flex">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
