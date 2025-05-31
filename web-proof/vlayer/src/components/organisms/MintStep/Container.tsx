import { useEffect, useRef, useState } from "react";

import { MintStepPresentational } from "./Presentational";
import { useAccount } from "wagmi";
import { useLocalStorage } from "usehooks-ts";
import { useNavigate } from "react-router";

export const MintStep = () => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [verifiedHandle, setVerifiedHandle] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [proverResult] = useLocalStorage("proverResult", "");

  useEffect(() => {
    if (proverResult) {
      const result = JSON.parse(proverResult);
      if (!result || !Array.isArray(result) || typeof result[1] !== "string") {
        throw new Error("Serialized prover result from local storage is invalid");
      }
      setVerifiedHandle(result[1]);
    }
    modalRef.current?.showModal();
  }, [proverResult]);

  const handleVerify = async () => {
    setIsVerifying(true);
    if (!proverResult) {
      return;
    }

    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Redirect to success page with the handle
      void navigate(`/success?tx=0x${Math.random().toString(16).slice(2)}&handle=${verifiedHandle}`);
    } catch (error) {
      console.error("Error during verification:", error);
      setIsVerifying(false);
    }
  };

  return (
    <MintStepPresentational
      handleMint={() => void handleVerify()}
      isMinting={isVerifying}
    />
  );
};
