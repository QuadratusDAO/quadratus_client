import React from "react";
import { useWalletStore } from "../store/wallet";
import backpackIcon from "../assets/backpack.jpeg";
import phantomIcon from "../assets/phantom.jpeg";
import solflareIcon from "../assets/solflare.jpeg";

interface Provider {
  name: string;
  icon: string;
  url: string;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const providers = [
  {
    name: "Phantom",
    icon: phantomIcon,
    url: "https://www.phantom.app/",
  },
  {
    name: "Solflare",
    icon: solflareIcon,
    url: "https://solflare.com/",
  },
  {
    name: "Backpack",
    icon: backpackIcon,
    url: "https://backpack.io/",
  },
];

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const wallet = useWalletStore();

  const handleSelectProvider = (providerName: string) => {
    wallet.setProviderName(providerName);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-10 ${
        isOpen ? "visible" : "hidden"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="flex flex-col bg-offWhite text-offBlack rounded-lg min-w-[400px] p-4 z-20">
        <h2 className="text-xl font-bold mb-4">Select Wallet</h2>

        <ul className="space-y-2 gap-4">
          {providers.map((provider: Provider, index: number) => (
            <li
              key={index}
              className="text-lg cursor-pointer hover:bg-offBlackHover hover:text-offWhite p-2 rounded-md transition duration-200 
    ease-in-out"
              onClick={() => handleSelectProvider(provider.name)}
            >
              <div className="flex items-center gap-2">
                <img
                  className="w-6 h-6 inline-block rounded-md"
                  src={provider.icon}
                  alt={provider.name}
                />
                <span>{provider.name}</span>
              </div>
            </li>
          ))}
        </ul>

        <button
          className="bg-offBlack text-white px-4 py-2 rounded mt-4 hover:bg-offBlackHover transition duration-300 ease-in-out"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
