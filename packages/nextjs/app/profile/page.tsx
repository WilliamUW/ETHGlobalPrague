"use client";

import { useAccount, useReadContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";

type Tier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

const TIER_THRESHOLDS: Record<Tier, number> = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 5,
  PLATINUM: 10,
  DIAMOND: 20,
};

const TIER_COLORS: Record<Tier, string> = {
  BRONZE: "text-amber-600",
  SILVER: "text-gray-400",
  GOLD: "text-yellow-500",
  PLATINUM: "text-blue-400",
  DIAMOND: "text-purple-500",
};

const TIER_ICONS: Record<Tier, string> = {
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  PLATINUM: "💎",
  DIAMOND: "👑",
};

const getTier = (balance: number): Tier => {
  if (balance >= TIER_THRESHOLDS.DIAMOND) return "DIAMOND";
  if (balance >= TIER_THRESHOLDS.PLATINUM) return "PLATINUM";
  if (balance >= TIER_THRESHOLDS.GOLD) return "GOLD";
  if (balance >= TIER_THRESHOLDS.SILVER) return "SILVER";
  return "BRONZE";
};

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
