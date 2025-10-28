import dynamic from "next/dynamic";
import AppShellSimple from "../components/Layout/AppShellSimple";
import CreateAccount from "../components/Auth/CreateAccount";

function RegisterVoterPage() {
  return (
    <AppShellSimple>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-crypto-ring mb-4">Register as Voter</h1>
        <p className="text-crypto-text mb-6">Create your on-chain username so others can find you.</p>
        <CreateAccount />
      </div>
    </AppShellSimple>
  );
}

// Disable SSR for this page to avoid export-time React 130 errors from browser-only libs
export default dynamic(() => Promise.resolve(RegisterVoterPage), { ssr: false });
