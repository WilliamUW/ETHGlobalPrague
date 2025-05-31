import { SuccessStepPresentational } from "./Presentational";
import { useAccount } from "wagmi";
import { useSearchParams } from "react-router";

export const SuccessStep = () => {
  const { chain } = useAccount();
  const [searchParams] = useSearchParams();
  const tx = searchParams.get("tx") || "";
  const handle = searchParams.get("handle") || "";

  return (
    <SuccessStepPresentational
      tx={tx}
      handle={handle}
      blockExplorer={chain?.blockExplorers?.default?.url}
    />
  );
};
