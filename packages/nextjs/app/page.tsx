"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";

interface Review {
  reviewer: `0x${string}`;
  rating: number;
  description: string;
  timestamp: bigint;
}

const Home = () => {
  const { address: connectedAddress } = useAccount();
  const [platform, setPlatform] = useState(0);
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState("");
  const [isSubmitExpanded, setIsSubmitExpanded] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const { data: deployedContractData } = useDeployedContractInfo("YourContract");

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isSubmitting } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: reviews = [] } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "getAllReviews",
    args: [platform, username],
    query: {
      enabled: !!username,
    },
  }) as { data: Review[] | undefined };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !description || !deployedContractData?.address) return;

    try {
      writeContract({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "submitReview",
        args: [platform, username, rating, description],
      });
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleLinkInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLinkInput(value);

    // Try to extract platform and username from the link
    try {
      const url = new URL(value);
      const path = url.pathname;

      // Telegram
      if (url.hostname.includes("t.me")) {
        setPlatform(0);
        setUsername(path.slice(1)); // Remove leading slash
        return;
      }

      // Twitter/X
      if (url.hostname.includes("x.com") || url.hostname.includes("twitter.com")) {
        setPlatform(1);
        setUsername(path.slice(1)); // Remove leading slash
        return;
      }

      // LinkedIn
      if (url.hostname.includes("linkedin.com")) {
        setPlatform(2);
        setUsername(path.split("/in/")[1]?.split("/")[0] || ""); // Extract username from /in/username
        return;
      }
    } catch (error) {
      // Invalid URL, do nothing
      console.error("Invalid URL:", error);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        {/* Platform and Username Selection */}
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg mb-8">
          <div className="space-y-6">
            {/* Link Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Or paste a profile link</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="https://t.me/username, https://x.com/username, or https://linkedin.com/in/username"
                value={linkInput}
                onChange={handleLinkInput}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <select
                className="select select-bordered w-full"
                value={platform}
                onChange={e => setPlatform(Number(e.target.value))}
              >
                <option value={0}>Telegram</option>
                <option value={1}>Twitter</option>
                <option value={2}>LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submit Review Form */}
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg mb-8">
          <button
            className="w-full flex justify-between items-center text-2xl font-bold mb-6"
            onClick={() => setIsSubmitExpanded(!isSubmitExpanded)}
          >
            <span>Submit a Review</span>
            <span className="text-2xl">{isSubmitExpanded ? "−" : "+"}</span>
          </button>

          {isSubmitExpanded && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`btn btn-circle ${rating === star ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setRating(star)}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Review Description</label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Write your review here..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting || !username || !description}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>

        {/* View Reviews Section */}
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>

          {/* Reviews Display */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="bg-base-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        Reviewer: <Address address={review.reviewer} />
                      </p>
                      <p className="text-sm text-base-content/70">
                        {new Date(Number(review.timestamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{review.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </div>
                  <p className="text-base-content/90">{review.description}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-base-content/70">
                {username ? "No reviews found" : "Enter a username to view reviews"}
              </p>
            )}
          </div>
        </div>

        {/* Connected Address Display */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm font-medium mb-2">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>
      </div>
    </div>
  );
};

export default Home;
