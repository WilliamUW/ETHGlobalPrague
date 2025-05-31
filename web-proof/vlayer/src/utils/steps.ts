import {
  ConnectWalletStep,
  InstallExtension,
  MintStep,
  ProveStep,
  SuccessStep,
  WelcomeScreen,
} from "../components";

export type Step = {
  kind: STEP_KIND;
  path: string;
  backUrl?: string;
  component: React.ComponentType;
  title: string;
  description: string;
  headerIcon?: string;
  index: number;
};

export enum STEP_KIND {
  WELCOME,
  CONNECT_WALLET,
  START_PROVING,
  MINT,
  INSTALL_EXTENSION,
  SUCCESS,
}
export const steps: Step[] = [
  {
    path: "",
    kind: STEP_KIND.WELCOME,
    component: WelcomeScreen,
    title: "TrustBuddy Verification",
    description:
      "Verify your Twitter handle ownership for TrustBuddy. This will create a cryptographic proof that you own the account, which can be used to build trust in the TrustBuddy platform.",
    headerIcon: "/nft-illustration.svg",
    index: 0,
  },
  {
    path: "connect-wallet",
    kind: STEP_KIND.CONNECT_WALLET,
    backUrl: "",
    component: ConnectWalletStep,
    title: "Connect Wallet",
    description:
      "Connect your wallet to proceed with the Twitter handle verification process.",
    index: 1,
  },
  {
    path: "start-proving",
    kind: STEP_KIND.START_PROVING,
    backUrl: "/connect-wallet",
    component: ProveStep,
    title: "Generate Proof",
    description:
      "Open vlayer browser extension and follow instructions to generate a proof of your Twitter account ownership.",
    index: 2,
  },
  {
    path: "install-extension",
    kind: STEP_KIND.INSTALL_EXTENSION,
    component: InstallExtension,
    backUrl: "/connect-wallet",
    title: "Install Extension",
    description: `Install the vlayer browser extension to generate your Twitter handle verification proof.`,
    index: 2,
  },
  {
    path: "mint",
    kind: STEP_KIND.MINT,
    backUrl: "/start-proving",
    component: MintStep,
    title: "Verify Twitter Handle",
    description: `You are all set to verify your Twitter handle ownership. This will create a cryptographic proof that you own the account.`,
    index: 3,
  },
  {
    path: "success",
    kind: STEP_KIND.SUCCESS,
    component: SuccessStep,
    title: "Verification Complete",
    description: "Your Twitter handle has been successfully verified. You can now use this verification in TrustBuddy.",
    headerIcon: "/success-illustration.svg",
    index: 4,
  },
];
