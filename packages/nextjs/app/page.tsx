"use client";

import { useEffect, useState } from "react";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { FaTwitter } from "react-icons/fa";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";

interface Review {
  reviewer: `0x${string}`;
  rating: number;
  description: string;
  timestamp: bigint;
}

export const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 5,
  DIAMOND: 10,
  PLATINUM: 20,
};

export const TIER_COLORS = {
  BRONZE: "text-amber-600",
  SILVER: "text-gray-400",
  GOLD: "text-yellow-500",
  PLATINUM: "text-blue-400",
  DIAMOND: "text-purple-500",
};

export const TIER_ICONS = {
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  PLATINUM: "👑",
  DIAMOND: "💎",
};

export type Tier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export const getTier = (balance: number): Tier => {
  if (balance >= TIER_THRESHOLDS.DIAMOND) return "DIAMOND";
  if (balance >= TIER_THRESHOLDS.PLATINUM) return "PLATINUM";
  if (balance >= TIER_THRESHOLDS.GOLD) return "GOLD";
  if (balance >= TIER_THRESHOLDS.SILVER) return "SILVER";
  return "BRONZE";
};

interface PlatformInfo {
  name: string;
  icon: string;
  color: string;
  logo: string;
}

const PLATFORM_INFO: Record<number, PlatformInfo> = {
  0: {
    name: "Telegram",
    icon: "📱",
    color: "bg-blue-600",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
  },
  1: {
    name: "Twitter",
    icon: "🐦",
    color: "bg-sky-600",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
  },
  2: {
    name: "LinkedIn",
    icon: "💼",
    color: "bg-blue-700",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
  },
};

// Inline badge for Twitter and tier
const ReviewerBadge = ({
  reviewer,
  contractAddress,
  contractAbi,
}: {
  reviewer: `0x${string}`;
  contractAddress?: `0x${string}`;
  contractAbi?: any;
}) => {
  const { data: twitterUsername } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "platformUsernames",
    args: [reviewer, 1], // 1 = Twitter
    query: { enabled: !!contractAddress },
  }) as { data: string | undefined };

  const { data: reviewerBalance } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "balanceOf",
    args: [reviewer],
    query: { enabled: !!contractAddress },
  });
  const balance = reviewerBalance ? Number(reviewerBalance) / 1e18 : 0;
  const tier = getTier(balance);

  return (
    <>
      {twitterUsername && twitterUsername !== "" && (
        <a
          href={`https://x.com/${twitterUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#1DA1F2] font-medium"
        >
          <FaTwitter className="w-4 h-4" />
          @{twitterUsername}
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-500" aria-label="Verified">
            <path fill="currentColor" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
          </svg>
        </a>
      )}
      <span className={`flex items-center gap-1 text-sm font-medium ${TIER_COLORS[tier]}`}>{TIER_ICONS[tier]} {tier}</span>
      <span className="text-sm text-gray-500">({balance.toFixed(1)} TBT)</span>
    </>
  );
};

const Home = () => {
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState("");
  const [isSubmitExpanded, setIsSubmitExpanded] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [platform, setPlatform] = useState(1);
  const [username, setUsername] = useState("HeyWilliamWang");
  const [linkInput, setLinkInput] = useState("https://x.com/HeyWilliamWang");

  const { data: deployedContractData } = useDeployedContractInfo("YourContract");

  const { writeContract, data: hash } = useWriteContract();

  const { data: reviews = [] } = useReadContract({
    address: deployedContractData?.address as `0x${string}`,
    abi: deployedContractData?.abi,
    functionName: "getAllReviews",
    args: [platform, username],
    query: {
      enabled: !!username && !!deployedContractData?.address,
    },
  }) as { data: Review[] | undefined };

  const { isLoading: isSubmitting } = useWaitForTransactionReceipt({
    hash,
  });

  // Update lastTxHash when hash changes
  useEffect(() => {
    if (hash) {
      setLastTxHash(hash);
      setSubmissionStatus("submitting");
    }
  }, [hash]);

  // Reset form when transaction is complete
  useEffect(() => {
    if (!isSubmitting && lastTxHash) {
      setDescription("");
      setIsSubmitExpanded(false);
      setSubmissionStatus("success");
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmissionStatus("idle");
      }, 3000);
    }
  }, [isSubmitting, lastTxHash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !description || !deployedContractData?.address) return;

    try {
      setSubmissionStatus("submitting");
      writeContract({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "submitReview",
        args: [platform, username, rating, description],
      });
    } catch {
      // ignore
    }
  };

  const averageRating =
    reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

  // Star breakdown for left column
  const starCounts = [5, 4, 3, 2, 1].map(star => reviews.filter(r => r.rating === star).length);
  const starPercents = starCounts.map(count => (reviews.length ? (count / reviews.length) * 100 : 0));

  // Handler for link input
  const handleLinkInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLinkInput(value);
    try {
      const urlString = value.startsWith("http") ? value : `https://${value}`;
      const url = new URL(urlString);
      const path = url.pathname;
      if (url.hostname.includes("t.me")) {
        setPlatform(0);
        setUsername(path.slice(1).replace(/^@+/, ""));
        return;
      }
      if (url.hostname.includes("x.com") || url.hostname.includes("twitter.com")) {
        setPlatform(1);
        setUsername(path.slice(1).replace(/^@+/, ""));
        return;
      }
      if (url.hostname.includes("linkedin.com")) {
        setPlatform(2);
        setUsername((path.split("/in/")[1]?.split("/")[0] || "").replace(/^@+/, ""));
        return;
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto pt-10">
      {/* Left: Summary/Filters */}
      <div className="w-full md:w-1/3">
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-2xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="flex text-green-600 text-xl">
              {Array(Math.round(averageRating)).fill(0).map((_, i) => <span key={i}>★</span>)}
            </span>
          </div>
          <div className="text-gray-700 font-semibold mb-4">All reviews</div>
          <div className="text-gray-500 mb-4">{reviews.length} total • <a href="#" className="text-blue-600 underline">Write a review</a></div>
          {/* Star breakdown */}
          <div className="space-y-2 mb-6">
            {[5,4,3,2,1].map((star, idx) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-8 text-sm">{star}-star</span>
                <div className="flex-1 bg-gray-200 rounded h-2">
                  <div className="bg-gray-500 h-2 rounded" style={{ width: `${starPercents[idx]}%` }} />
                </div>
                <span className="w-8 text-sm text-right">{starCounts[idx]}</span>
              </div>
            ))}
          </div>
          {/* (Optional) Filters/Search */}
          <input className="input input-bordered w-full mb-2" placeholder="Search by keyword..." />
          <button className="btn btn-sm w-full mb-2">More filters</button>
          <button className="btn btn-sm w-full">Most recent ▼</button>
        </div>
      </div>
      {/* Right: Review Form + Reviews List */}
      <div className="w-full md:w-2/3">
        {/* Platform/Username/Link Input */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <div className="space-y-6">
            {/* Link Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Paste a Profile Link</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="https://t.me/username, https://x.com/username, or https://linkedin.com/in/username"
                value={linkInput}
                onChange={handleLinkInput}
              />
            </div>
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(PLATFORM_INFO).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                      platform === Number(key) ? `${info.color} text-white` : "bg-base-200 hover:bg-base-300"
                    }`}
                    onClick={() => setPlatform(Number(key))}
                  >
                    <img
                      src={info.logo}
                      alt={info.name}
                      className={`w-8 h-8 mb-2 ${platform === Number(key) ? "" : ""}`}
                    />
                    <span className="text-sm font-medium">{info.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  className="input input-bordered w-full pl-12"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/^@+/, ""))}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">{PLATFORM_INFO[platform].icon}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Review Submission Form */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <button
            className="w-full flex justify-between items-center text-2xl font-bold mb-6 hover:opacity-80 transition-opacity"
            onClick={() => setIsSubmitExpanded(!isSubmitExpanded)}
          >
            <div className="flex items-center gap-3">
              <span>Submit a Review</span>
              {!isSubmitExpanded && username && (
                <div className="flex items-center gap-2 text-sm font-normal text-base-content/70">
                  <img src={PLATFORM_INFO[platform].logo} alt={PLATFORM_INFO[platform].name} className="w-4 h-4" />
                  <span>
                    {PLATFORM_INFO[platform].name}/{username}
                  </span>
                </div>
              )}
            </div>
            <span className="text-2xl bg-base-200 w-8 h-8 rounded-full flex items-center justify-center">
              {isSubmitExpanded ? "−" : "+"}
            </span>
          </button>

          {isSubmitExpanded && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">How would you rate this profile?</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`flex-1 aspect-square flex items-center justify-center rounded-xl transition-all ${
                        rating >= star ? "bg-primary/10" : "bg-base-200 hover:bg-base-300"
                      }`}
                      onClick={() => setRating(star)}
                    >
                      <span className={`text-2xl ${rating >= star ? "text-yellow-500" : "text-gray-300"}`}>
                        {rating >= star ? "★" : "☆"}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-sm text-base-content/70">
                  {rating === 5 && "Excellent"}
                  {rating === 4 && "Very Good"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Poor"}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  className="textarea textarea-bordered rounded-lg w-full h-32 text-base"
                  placeholder="Share your experience with this profile. What makes them trustworthy or not? What was your interaction like?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
                <div className="mt-1 text-sm text-base-content/70">{description.length}/500 characters</div>
              </div>

              {/* Submit Button and Status */}
              <div className="space-y-4">
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${submissionStatus === "submitting" ? "opacity-50" : ""}`}
                  disabled={submissionStatus === "submitting" || !username || !description}
                >
                  {submissionStatus === "submitting" ? (
                    <div className="flex items-center gap-2">
                      <span>Submitting Review</span>
                      <span className="text-sm opacity-80">({rating}★)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Submit Review</span>
                      <span className="text-sm opacity-80">({rating}★)</span>
                    </div>
                  )}
                </button>

                {submissionStatus === "submitting" && (
                  <div className="space-y-2">
                    <div className="w-full bg-base-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
                    </div>
                    <p className="text-sm text-base-content/70 text-center">Submitting review to smart contract...</p>
                    {lastTxHash && (
                      <a
                        href={`https://coston2-explorer.flare.network/tx/${lastTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary text-sm text-center block"
                      >
                        View transaction on BlockScout&apos;s Coston2 Explorer
                      </a>
                    )}
                  </div>
                )}

                {submissionStatus === "success" && (
                  <div className="text-center space-y-2">
                    <div className="text-success text-lg font-medium">Review successfully submitted! 🎉</div>
                  </div>
                )}

                {!username && (
                  <div className="text-sm text-base-content/70 text-center">
                    Please select a platform and enter a username to submit a review
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
        {/* Reviews List */}
        <div>
          {reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-2xl shadow p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {/* Avatar (use blockie or placeholder) */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                    {review.reviewer.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{review.reviewer.slice(0, 6)}...{review.reviewer.slice(-4)}</span>
                      <ReviewerBadge
                        reviewer={review.reviewer as `0x${string}`}
                        contractAddress={deployedContractData?.address as `0x${string}`}
                        contractAbi={deployedContractData?.abi}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex text-yellow-500 text-lg">
                        {[1,2,3,4,5].map(i => (
                          <span key={i}>{i <= review.rating ? "★" : "☆"}</span>
                        ))}
                      </span>
                      <span className="text-gray-500 text-sm">{review.rating}.0</span>
                      <span className="text-xs text-gray-400 ml-2">{new Date(Number(review.timestamp) * 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-base text-gray-800 whitespace-pre-line">{review.description}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              {username ? "No reviews found" : "Enter a username to view reviews"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
