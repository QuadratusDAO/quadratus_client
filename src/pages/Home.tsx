import React, { useEffect } from "react";
import { useWalletStore } from "../store";

// import InitalizeButton from "../components/InitializeButton";

import HeroBanner from "../components/HeroBanner";

const Home: React.FC = () => {
  const wallet = useWalletStore();

  useEffect(() => {
    if (!wallet.provider) return;
  }, [wallet.provider]);

  useEffect(() => {
    if (!wallet.publicKey) return;
  }, [wallet.publicKey]);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <HeroBanner />

      {/* <InitalizeButton /> */}
    </div>
  );
};

export default Home;
