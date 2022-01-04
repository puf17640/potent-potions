import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useWallet } from "use-wallet";
import toast, { Toaster } from "react-hot-toast";
import { useTransition, animated } from "react-spring";
import Navbar from "../components/Navbar";
import ChestCloseup from "../components/ChestCloseup";
import { useEffect, useState } from "react";
import { useMintAvailable } from "../hooks/useMintAvailable";

const BACKGROUND_IMAGES = {
  open: "/assets/s1-open.gif",
  closed: "/assets/s1-closed.gif",
};

const Home: NextPage = () => {
  const wallet = useWallet();
  const { status, networkName } = wallet;

  const [background, setBackground] = useState("closed");
  const [closeUp, setCloseup] = useState(false);
  const [whitelistProof, setWhitelistProof] = useState([]);
  const toggleCloseup = () => setCloseup(!closeUp);

  const {
    available,
    isLoading,
    update: updateMintAvailable,
  } = useMintAvailable(whitelistProof);

  useEffect(() => {
    if (status === "connected") {
      fetch(`/api/whitelist?address=${wallet.account}`).then(async (res) => {
        const proof: string[] = await res.json();
        console.log("merkleProof", proof);
        setWhitelistProof(proof);
      });
    }
    setBackground(available && status === "connected" ? "open" : "closed");
    setCloseup(available && closeUp);
  }, [status, available, closeUp, wallet]);

  useEffect(() => {
    let interval = setInterval(updateMintAvailable, 2500);
    return () => clearInterval(interval);
  });

  const renderState = (): React.ReactFragment => {
    switch (background) {
      case "open":
        return (
          <div
            className="w-screen h-screen"
            onClick={(e) =>
              status === "connected"
                ? toggleCloseup()
                : toast("Connect your wallet.", { icon: "👝" })
            }
          ></div>
        );
      case "closed":
        return (
          <div
            className="w-screen h-screen"
            onClick={(e) =>
              toast("The chest is closed. Wait for it to open up.", {
                icon: "💤",
              })
            }
          ></div>
        );
    }
  };

  return (
    <div
      className="min-h-screen m-auto min-w-screen"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGES[background]})`,
        backgroundPosition: "45% center",
        backgroundSize: "cover",
      }}
    >
      <Head>
        <title>MegaRetro{"'"}s Potent Potions Season 1</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-right" reverseOrder={true} />
      <Navbar />
      <div className="h-screen">{renderState()}</div>
      {closeUp && (
        <ChestCloseup
          toggleCloseup={toggleCloseup}
          merkleProof={whitelistProof}
        />
      )}
    </div>
  );
};

export default Home;
