import React, { useEffect, useState, useRef } from "react";
import { useWalletStore } from "../store/wallet";
import WalletModal from "./WalletModal";
import { IoIosArrowDown } from "react-icons/io";
import { PublicKey } from "@solana/web3.js";
import backpackIcon from "../assets/backpack.jpeg";
import phantomIcon from "../assets/phantom.jpeg";
import solflareIcon from "../assets/solflare.jpeg";

declare const window: any;

const styles = {
  buttonClass: `flex gap-2 bg-offBlack p-2 px-4 rounded-md w-full text-offWhite hover:bg-offBlackHover`,
  liClass:
    "w-full text-black rounded-sm hover:bg-offWhiteHover p-2 cursor-pointer  w-full",
  ulClass: "flex flex-col w-full p-1 ",
};

const ConnectWallet: React.FC = () => {
  const dropdownRef: any = useRef(null);

  const wallet = useWalletStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };

  const renderWalletIcon = () => {
    if (wallet.providerName === "Phantom") {
      return phantomIcon;
    } else if (wallet.providerName === "Solflare") {
      return solflareIcon;
    } else if (wallet.providerName === "Backpack") {
      return backpackIcon;
    } else {
      return "";
    }
  };

  const handleDisconnect = () => {
    wallet.provider?.disconnect();
    wallet.disconnect();
  };

  const connectWallet = async (
    publicKey: PublicKey,
    provider: any,
    providerName?: string
  ) => {
    try {
      setShowDropdown(false);

      wallet.updateWallet({
        providerName: wallet.providerName || providerName,
        provider: provider,
        publicKey: publicKey.toString(),
        connected: true,
      });

      localStorage.setItem(
        "walletState",
        JSON.stringify({
          providerName: wallet.providerName || providerName,
          balance: wallet.balance,
          publicKey: publicKey.toString(),
          connected: true,
        })
      );
    } catch (error) {
      console.log(error);
      wallet.disconnect();
    }
  };

  const connectWithWallet = async (provider: any, providerName: string) => {
    try {
      const isConnected =
        (await provider.connect()) || (await provider["connect"]());

      if (isConnected) {
        const publicKey = await provider.publicKey;

        connectWallet(publicKey, provider, providerName);
      }
    } catch (error) {
      console.log(error);
      wallet.disconnect();
    }
  };

  const handleConnect = async (providerName?: string) => {
    try {
      switch (wallet.providerName || providerName) {
        case "Phantom":
          connectWithWallet(window?.phantom?.solana, "Phantom");
          break;
        case "Solflare":
          connectWithWallet(window?.solflare, "Solflare");
          break;
        case "Backpack":
          connectWithWallet(window?.backpack, "Backpack");
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
      wallet.disconnect();
    }
  };

  // const autoConnect = async () => {
  //   try {
  //     const storedWallet = localStorage.getItem("walletState");
  //     if (!storedWallet) return;

  //     const walletState = JSON.parse(storedWallet);
  //     if (!walletState.providerName) return;

  //     await handleConnect(walletState.providerName);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   autoConnect();
  // }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <>
      <WalletModal isOpen={isOpen} onClose={onClose} />

      <div className="flex items-center justify-end h-full w-full font-inter ">
        {!wallet.providerName && !wallet.connected && (
          <button
            className={styles.buttonClass}
            onClick={() => setIsOpen(true)}
          >
            Select Wallet
          </button>
        )}

        {wallet.providerName && !wallet.connected && (
          <button
            className={styles.buttonClass}
            onClick={() => handleConnect()}
          >
            Connect Wallet
          </button>
        )}

        {wallet.connected && wallet.providerName && (
          <div ref={dropdownRef} className="relative">
            <div className="flex items-center justify-center gap-2 text-sm">
              <button
                className={styles.buttonClass}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="flex items-center justify-center gap-2">
                  <img
                    className="w-6 h-6 inline-block rounded-md shadow-sm"
                    src={renderWalletIcon()}
                    alt={wallet.providerName}
                  />

                  <div className="flex h-full items-center justify-center gap-2 ">
                    {wallet.publicKey.substring(0, 4)}...
                    {wallet.publicKey.substring(
                      wallet.publicKey.length - 4,
                      wallet.publicKey.length
                    )}
                    <IoIosArrowDown className="text-lg" />
                  </div>
                </div>
              </button>
            </div>

            {/* wallet dropdown */}
            {showDropdown && (
              <div
                className={
                  "absolute text-sm left-0 top-12 w-full flex items-start justify-start bg-offWhite shadow-lg"
                }
              >
                <div className="flex cursor-pointer w-full">
                  <ul className={styles.ulClass}>
                    <li onClick={handleDisconnect} className={styles.liClass}>
                      Disconnect
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ConnectWallet;
