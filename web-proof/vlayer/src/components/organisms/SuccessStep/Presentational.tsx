import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";

export const SuccessStepPresentational = ({
  tx,
  handle,
  blockExplorer,
}: {
  tx: string;
  handle: string;
  blockExplorer?: string;
}) => {
  // Redirect back to main app with the verified handle
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      window.location.href = `http://localhost:3000/verify?handle=${handle}`;
    }, 2000); // Wait 2 seconds before redirecting

    return () => clearTimeout(redirectTimer);
  }, [handle]);

  return (
    <>
      <p className="text-gray-500">
        @{handle} was verified successfully!{" "}
        <a
          href={`${blockExplorer}/tx/${tx}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-500 underline"
        >
          {tx.slice(0, 6)}...{tx.slice(-4)}
        </a>
      </p>
      <p className="text-gray-500">
        <a
          href={`${blockExplorer}/tx/${tx}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold leading-4 text-center text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 inline-flex items-center"
          tabIndex={0}
        >
          See it on block explorer
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 ml-1" />
        </a>
      </p>
      <p className="text-gray-500 mt-4">
        Redirecting back to main app...
      </p>
    </>
  );
};
