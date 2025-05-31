"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useEffect, useState } from "react";

import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";
import { useSearchParams } from "next/navigation";

const Verify = () => {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  const [verifiedHandle, setVerifiedHandle] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { data: deployedContractData } = useDeployedContractInfo("YourContract");
  const { writeContractAsync } = useWriteContract();

  const { data: twitterHandle } = useReadContract({
    address: deployedContractData?.address as `0x${string}`,
    abi: deployedContractData?.abi,
    functionName: "platformUsernames",
    args: [connectedAddress, 1], // 1 is the Twitter platform enum value
    query: {
      enabled: !!connectedAddress && !!deployedContractData?.address,
    },
  }) as { data: string | undefined };

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
      const hash = await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "submitUsername",
        args: [1, verifiedHandle], // 1 is the Twitter platform enum value
      });

      if (hash) {
        setTxHash(hash);
      }
    } catch (error) {
      console.error("Error submitting username:", error);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg mb-8">
          <h1 className="text-2xl font-bold mb-6">Verify Your Social Handles</h1>

          {/* Current Verified Handles */}
          {twitterHandle && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Your Verified Handles</h2>
              <div className="mb-6">
                <div className="text-sm font-medium text-base-content/70 mb-2">Verified Twitter Handle</div>
                <div className="flex items-center gap-3 p-4 bg-base-200 rounded-xl">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg"
                    alt="Twitter"
                    className="w-8 h-8"
                  />
                  <div>
                    <div className="font-medium">@{twitterHandle}</div>
                    <div className="text-sm text-base-content/70">Verified</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Twitter Verification */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Twitter</h2>
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
                <div className="mb-6">
                  <div className="text-sm font-medium text-base-content/70 mb-2">Verified Twitter Handle</div>
                  <div className="flex items-center gap-3 p-4 bg-base-200 rounded-xl">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg"
                      alt="Twitter"
                      className="w-8 h-8"
                    />
                    <div>
                      <div className="font-medium">@{verifiedHandle}</div>
                      <div className="text-sm text-base-content/70">Verified</div>
                    </div>
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
                {txHash && (
                  <div className="mt-4 p-4 bg-base-200 rounded-xl">
                    <p className="text-sm text-base-content/70 mb-2">Transaction submitted!</p>
                    <a
                      href={`https://coston2-explorer.flare.network/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View on Blockscout
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Telegram Verification (Coming Soon) */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Telegram</h2>
            <div className="space-y-6">
              <p className="text-base-content/70">
                Verify your Telegram handle ownership. This will create a cryptographic proof that you own the Telegram account.
              </p>
              <div className="flex items-center gap-3 p-4 bg-base-200 rounded-xl opacity-60">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                  alt="Telegram"
                  className="w-8 h-8"
                />
                <div className="flex-1">
                  <div className="font-medium">Telegram Handle</div>
                  <div className="text-sm text-base-content/70">Coming Soon</div>
                </div>
                <div className="text-xs bg-base-300 text-base-content/70 px-2 py-1 rounded-full">Soon</div>
              </div>
              <button className="btn btn-primary w-full opacity-50 cursor-not-allowed" disabled>
                Start Verification
              </button>
            </div>
          </div>

          {/* LinkedIn Verification (Coming Soon) */}
          <div>
            <h2 className="text-xl font-bold mb-4">LinkedIn</h2>
            <div className="space-y-6">
              <p className="text-base-content/70">
                Verify your LinkedIn profile ownership. This will create a cryptographic proof that you own the LinkedIn account.
              </p>
              <div className="flex items-center gap-3 p-4 bg-base-200 rounded-xl opacity-60">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                  alt="LinkedIn"
                  className="w-8 h-8"
                />
                <div className="flex-1">
                  <div className="font-medium">LinkedIn Profile</div>
                  <div className="text-sm text-base-content/70">Coming Soon</div>
                </div>
                <div className="text-xs bg-base-300 text-base-content/70 px-2 py-1 rounded-full">Soon</div>
              </div>
              <button className="btn btn-primary w-full opacity-50 cursor-not-allowed" disabled>
                Start Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify; 