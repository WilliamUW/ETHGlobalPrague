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

  // Search state
  const [searchPlatform, setSearchPlatform] = useState(0);
  const [searchUsername, setSearchUsername] = useState("");

  const { data: deployedContractData } = useDeployedContractInfo("YourContract");

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isSubmitting } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: reviews = [] } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "getAllReviews",
    args: [searchPlatform, searchUsername],
    query: {
      enabled: !!searchUsername,
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

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Review System</span>
        </h1>

        {/* Submit Review Form */}
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6">Submit a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Platform Selection */}
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

            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

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
        </div>

        {/* View Reviews Section */}
        <div className="bg-base-100 p-8 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">View Reviews</h2>
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <select
                className="select select-bordered w-full"
                value={searchPlatform}
                onChange={e => setSearchPlatform(Number(e.target.value))}
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
                placeholder="Enter username to search"
                value={searchUsername}
                onChange={e => setSearchUsername(e.target.value)}
              />
            </div>
          </div>

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
                {searchUsername ? "No reviews found" : "Enter a username to search for reviews"}
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
