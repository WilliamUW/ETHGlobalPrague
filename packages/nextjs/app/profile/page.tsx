"use client";

import { TIER_COLORS, TIER_ICONS, TIER_THRESHOLDS, Tier, getTier } from "../page";
import { useAccount, useReadContract } from "wagmi";

import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";

const Profile = () => {
  const { address: connectedAddress } = useAccount();
  const { data: deployedContractData } = useDeployedContractInfo("YourContract");

  const { data: tokenBalance } = useReadContract({
    address: deployedContractData?.address as `0x${string}`,
    abi: deployedContractData?.abi,
    functionName: "balanceOf",
    args: [connectedAddress],
    query: {
      enabled: !!connectedAddress && !!deployedContractData?.address,
    },
  });

  const { data: twitterHandle } = useReadContract({
    address: deployedContractData?.address as `0x${string}`,
    abi: deployedContractData?.abi,
    functionName: "platformUsernames",
    args: [connectedAddress, 1], // 1 is the Twitter platform enum value
    query: {
      enabled: !!connectedAddress && !!deployedContractData?.address,
    },
  }) as { data: string | undefined };

  const balance = tokenBalance ? Number(tokenBalance) / 1e18 : 0;
  const currentTier = getTier(balance);

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        {/* Profile Card */}
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg mb-8">
          <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

          {/* Connected Address */}
          <div className="mb-6">
            <div className="text-sm font-medium text-base-content/70 mb-2">Connected Address</div>
            <Address address={connectedAddress} />
          </div>

          {/* Verified Twitter Handle */}
          {twitterHandle && (
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
          )}

          {/* Token Balance and Current Tier */}
          <div className="mb-8">
            <div className="text-sm font-medium text-base-content/70 mb-2">Token Balance</div>
            <div className="text-2xl font-bold text-primary mb-2">{balance.toFixed(1)} TBT</div>
            <div className={`text-lg font-medium ${TIER_COLORS[currentTier]} flex items-center gap-2`}>
              {TIER_ICONS[currentTier]} {currentTier} Tier
            </div>
          </div>

          {/* Tier Information */}
          <div>
            <h2 className="text-xl font-bold mb-4">Tier System</h2>
            <div className="space-y-4">
              {(Object.keys(TIER_THRESHOLDS) as Tier[]).map(tier => (
                <div
                  key={tier}
                  className={`p-4 rounded-xl ${
                    tier === currentTier ? "bg-primary/10" : "bg-base-200"
                  } flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xl ${TIER_COLORS[tier]}`}>{TIER_ICONS[tier]}</span>
                    <div>
                      <div className={`font-medium ${TIER_COLORS[tier]}`}>{tier}</div>
                      <div className="text-sm text-base-content/70">
                        {TIER_THRESHOLDS[tier]} {TIER_THRESHOLDS[tier] === 1 ? "TBT" : "TBT"} required
                      </div>
                    </div>
                  </div>
                  {tier === currentTier && (
                    <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full">Current Tier</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
