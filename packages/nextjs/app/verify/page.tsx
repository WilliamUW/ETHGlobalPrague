"use client";

import { useAccount, useWriteContract } from "wagmi";
import { useEffect, useState } from "react";

import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";
import { useSearchParams } from "next/navigation";

const Verify = () => {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  const [verifiedHandle, setVerifiedHandle] = useState<string | null>(null);
  const { data: deployedContractData } = useDeployedContractInfo("YourContract");
  const { writeContract } = useWriteContract();

  // Check for verified handle in URL params
  useEffect(() => {
    const handle = searchParams.get("handle");
    if (handle) {
      setVerifiedHandle(handle);
    }
  }, [searchParams]);

  const handleVerifyTwitter = () => {
    // Open vlayer app in a new window
    window.open("http://localhost:5173", "_blank");
  };

  const handleSubmitUsername = async () => {
    if (!verifiedHandle || !deployedContractData?.address) return;

    try {
      writeContract({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "submitUsername",
        args: [1, verifiedHandle], // 1 is the Twitter platform enum value
      });
    } catch (error) {
      console.error("Error submitting username:", error);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg mb-8">
          <h1 className="text-2xl font-bold mb-6">Verify Your Twitter Handle</h1>

          {!verifiedHandle ? (
            <div className="space-y-6">
              <p className="text-base-content/70">
                Verify your Twitter handle ownership using vlayer web prover. This will create a cryptographic proof that
                you own the Twitter account.
              </p>
              <button
                className="btn btn-primary w-full"
                onClick={handleVerifyTwitter}
                disabled={!connectedAddress}
              >
                Start Verification
              </button>
              {!connectedAddress && (
                <p className="text-sm text-base-content/70 text-center">
                  Please connect your wallet to start verification
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-base-200 rounded-xl">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg"
                  alt="Twitter"
                  className="w-8 h-8"
                />
                <div>
                  <div className="font-medium">Verified Twitter Handle</div>
                  <div className="text-base-content/70">@{verifiedHandle}</div>
                </div>
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={handleSubmitUsername}
                disabled={!connectedAddress}
              >
                Submit to Smart Contract
              </button>
              {!connectedAddress && (
                <p className="text-sm text-base-content/70 text-center">
                  Please connect your wallet to submit the verified handle
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify; 