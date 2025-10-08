// pages/index.js
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAccount, useReadContract } from "wagmi";
import Layout from "../components/Layout/Layout";
import Dashboard from "../components/Dashboard/Dashboard";
import Chat from "../components/Chat/Chat";
import FriendsList from "../components/Friends/FriendsList";
import TransferHistory from "../components/Transfers/TransferHistory";
import Profile from "../components/Profile/Profile";
import Settings from "../components/Settings/Settings";
import CreateAccount from "../components/Auth/CreateAccount";
import { ChatAppABI, CONTRACT_ADDRESS } from "../contracts/ChatApp";
import CustomConnectButton from "../components/Layout/CustomConnectButton";
import { FiShield, FiZap, FiUsers, FiMessageCircle } from "react-icons/fi";

// ✅ dynamic import to get the *default* export & disable SSR (prevents server crash)
const BlockchainNetworkBG = dynamic(
  () =>
    import("../components/FX/BlockchainNetworkBG").then(
      (m) => m.default || m
    ),
  { ssr: false, loading: () => null }
);

/* ============================================================
   BOTTOM FX: Subtle Orbital Chains (clipped + faded)
   - stays in bottom band only
   - masked with gradient so top edge is transparent
   ============================================================ */
function ChainOrbitsInline({
  height = 160,
  hueA = 172,
  hueB = 268,
  rings = 4,
  nodesPerRing = 10,
  speed = 0.28,
  alpha = 0.55,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

    let W = 0,
      H = height;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      W = Math.floor(window.innerWidth);
      H = height;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(DPR, DPR);
    };
    resize();

    const cx = W * 0.5;
    const cy = H + 70;
    const maxR = Math.min(W * 0.45, H * 1.5);

    const ringCfg = Array.from({ length: rings }).map((_, i) => {
      const t = i / Math.max(1, rings - 1);
      const r = maxR * (0.45 + 0.45 * t);
      return {
        r,
        hue: hueA + (hueB - hueA) * t,
        count: Math.max(6, Math.round(nodesPerRing * (0.75 + 0.4 * t))),
        dir: i % 2 ? -1 : 1,
      };
    });

    const angles = ringCfg.map((cfg) =>
      Array.from({ length: cfg.count }).map((_, k) => (k / cfg.count) * Math.PI)
    );

    let t = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const g = ctx.createRadialGradient(cx, H, 0, cx, H, Math.max(W, H));
      g.addColorStop(0, "rgba(15,25,40,0.35)");
      g.addColorStop(1, "rgba(8,12,20,0.9)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      ringCfg.forEach((cfg, idx) => {
        const r = cfg.r;
        const col = (a) => `hsla(${cfg.hue},100%,65%,${a * alpha})`;

        ctx.strokeStyle = col(0.35);
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, 0, false);
        ctx.stroke();

        ctx.strokeStyle = col(0.12);
        ctx.lineWidth = 6;
        ctx.stroke();

        const angs = angles[idx];
        for (let k = 0; k < angs.length; k++) {
          angs[k] += cfg.dir * (speed * 0.0025 + k * 0.00001);
          if (angs[k] < Math.PI) angs[k] = Math.PI;
          if (angs[k] > Math.PI * 2) angs[k] = Math.PI * 2;

          const a = angs[k];
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;

          const a2 = angs[(k + 1) % angs.length];
          const x2 = cx + Math.cos(a2) * r;
          const y2 = cy + Math.sin(a2) * r;
          const d = Math.hypot(x2 - x, y2 - y);
          const linkAlpha = Math.max(0, 1 - d / 180);
          ctx.strokeStyle = col(0.28 * linkAlpha);
          ctx.lineWidth = 1 * linkAlpha;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(a + t * 0.25);
          const s = 6.5;
          ctx.fillStyle = col(0.18);
          ctx.strokeStyle = col(0.45);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.rect(-s / 2, -s / 2, s, s);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          const grad = ctx.createRadialGradient(x, y, 0, x, y, 18);
          grad.addColorStop(0, col(0.9));
          grad.addColorStop(1, col(0));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalCompositeOperation = "source-over";
      t += 0.02;
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [height, hueA, hueB, rings, nodesPerRing, speed, alpha]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0"
      style={{
        height,
        WebkitMaskImage:
          "linear-gradient(to top, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
        maskImage:
          "linear-gradient(to top, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
      }}
    />
  );
}

/* ====================== PAGE ====================== */
export default function Home() {
  const { address, isConnected } = useAccount();
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // ✅ Gate the read until we actually have an address (prevents errors)
  const {
    data: userExistsData,
    refetch: refetchUserExists,
    isFetching,
    isFetched,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "checkUserExists",
    args: [address],
    account: address,
    // wagmi v2: put enable flag under `query`
    query: {
      enabled: Boolean(isConnected && address),
      refetchOnWindowFocus: false,
    },
  });

  // mirror second file's behavior
  useEffect(() => {
    if (isConnected && address) {
      if (userExistsData !== undefined) {
        setUserExists(Boolean(userExistsData));
        setLoading(false);
      } else {
        // still waiting on the read
        setLoading(isFetching);
      }
    } else {
      // disconnected → no loading spinner for contract
      setLoading(false);
    }
  }, [userExistsData, isConnected, address, isFetching]);

  const handleAccountCreated = () => {
    refetchUserExists?.();
  };

  /* ===================== NOT CONNECTED ===================== */
  if (!isConnected) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#06080E] text-slate-100">
        {/* animated network background */}
        <BlockchainNetworkBG
          density={6000}
          connectRadius={200}
          speed={0.34}
          pulseCount={36}
          glow
        />

        <div className="relative z-10 [perspective:1600px]">
          <TopNav />
          <ScrollScene3D spacing="space-y-12 md:space-y-16">
            <Hero3D />
            <FeatureCubes3D />
            <MoneyModules3D />
            <Timeline3D />
          </ScrollScene3D>
        </div>

        <div className="fixed right-5 bottom-5 z-20">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,.35)]">
            <div
              className="
              [&>div]:w-auto
              [&>div>button]:w-auto
              [&>div>button]:rounded-xl
              [&>div>button]:px-4
              [&>div>button]:py-2.5
              [&>div>button]:text-sm
              [&>div>button]:bg-gradient-to-r
              [&>div>button]:from-[#18FFC7]
              [&>div>button]:to-[#27B0FF]
              [&>div>button]:border-0
              [&>div>button]:shadow-[0_6px_24px_rgba(39,176,255,.35)]
            "
            >
              <CustomConnectButton />
            </div>
          </div>
        </div>

        <ChainOrbitsInline height={160} rings={4} nodesPerRing={10} alpha={0.5} />

        <style jsx>{`
          @keyframes gradx {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradx 10s ease-in-out infinite;
          }
          .module3d {
            transform-style: preserve-3d;
            transform: translateZ(-150px) rotateX(5deg) rotateY(-6deg);
            opacity: 0;
            transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1),
              opacity 700ms ease;
          }
          .module3d.reveal {
            transform: translateZ(0) rotateX(0) rotateY(0);
            opacity: 1;
          }
          .module3d.depth-1 {
            transform: translateZ(-180px) rotateX(7deg) rotateY(-8deg);
          }
          .module3d.depth-2 {
            transform: translateZ(-210px) rotateX(9deg) rotateY(-10deg);
          }
        `}</style>
      </div>
    );
  }

  /* ===================== LOADING ===================== */
  if (loading) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#06080E] text-slate-200">
        <BlockchainNetworkBG
          density={7000}
          connectRadius={160}
          pulseCount={22}
          speed={0.28}
        />
        <div className="z-10 text-center">
          <div className="mx-auto mb-6 h-24 w-24 rounded-full p-[2px] bg-gradient-to-r from-[#18FFC7] via-[#27B0FF] to-[#B66BFF] animate-[spin_6s_linear_infinite]">
            <div className="grid h-full w-full place-items-center rounded-full bg-[#06080E]">
              <FiMessageCircle size={22} className="text-cyan-300" />
            </div>
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-[#18FFC7] to-[#27B0FF] bg-clip-text text-transparent">
            Connecting to ChatLedger…
          </h2>
          <p className="mt-1 text-slate-400">Booting blockchain services</p>
        </div>
      </div>
    );
  }

  /* ===================== ONBOARD ===================== */
  if (!userExists) {
    return <CreateAccount onAccountCreated={handleAccountCreated} />;
  }

  /* ===================== APP (unchanged) ===================== */
  const renderContent = (activeTab) => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "chat":
        return <Chat />;
      case "friends":
        return <FriendsList onStartChat={() => {}} hideSection={true} />;
      case "transfers":
        return <TransferHistory />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderContent}</Layout>;
}

/* ---------- UI modules (tightened spacing) ---------- */
function TopNav() {
  return (
    <header className="sticky top-0 z-10 bg-gradient-to-b from-[#06080E] to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-2xl bg-gradient-to-br from-[#18FFC7] via-[#27B0FF] to-[#B66BFF]" />
          <span className="font-semibold tracking-tight">ChatLedger</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Built on your <span className="text-cyan-300">Storledger</span> contract
        </span>
      </div>
    </header>
  );
}

function ScrollScene3D({ children, spacing = "space-y-12 md:space-y-16" }) {
  const containerRef = useRef(null);
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll(".module3d"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("reveal")
        ),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.18 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return <main ref={containerRef} className={`${spacing}`}>{children}</main>;
}

function Hero3D() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-6 pt-6">
      <div className="module3d col-span-12 md:col-span-6 lg:col-span-5">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,.9)]" />
          on-chain chat • ETH & ERC-20 • IPFS media
        </div>
        <h1 className="text-[38px] sm:text-[46px] lg:text-[54px] font-extrabold leading-[1.06] tracking-tight">
          <span className="bg-gradient-to-r from-[#18FFC7] via-[#27B0FF] to-[#B66BFF] bg-clip-text text-transparent animate-gradient-x">
            Own your conversations.
          </span>
        </h1>
        <p className="mt-2 text-slate-300/90">
          Send messages, media and money — all secured by your wallet. No
          servers, no custodians.
        </p>

        <div
          className="mt-4 max-w-sm
          [&>div]:w-full
          [&>div>button]:w-full
          [&>div>button]:rounded-2xl
          [&>div>button]:py-3.5
          [&>div>button]:text-base
          [&>div>button]:font-semibold
          [&>div>button]:bg-gradient-to-r
          [&>div>button]:from-[#18FFC7]
          [&>div>button]:via-[#27B0FF]
          [&>div>button]:to-[#B66BFF]
          [&>div>button]:border-0
          [&>div>button]:shadow-[0_10px_40px_rgba(39,176,255,.35)]
        "
        >
          <CustomConnectButton />
        </div>

        <p className="mt-2 text-[11px] text-slate-400">
          Secure WalletConnect / RainbowKit
        </p>
      </div>

      <div className="module3d depth-1 col-span-12 md:col-span-6 lg:col-span-7">
        <PreviewStack />
      </div>
    </section>
  );
}

function FeatureCubes3D() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="module3d depth-2 rounded-[22px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Cube title="Secure" icon={<FiShield size={18} />} desc="On-chain identity & permissioned friends" />
          <Cube title="Instant" icon={<FiZap size={18} />} desc="Reactive UI with live contract events" />
          <Cube title="Social" icon={<FiUsers size={18} />} desc="Friends, profiles, and IPFS media" />
        </div>
      </div>
    </section>
  );
}
function Cube({ title, icon, desc }) {
  return (
    <div className="group relative h-36 rounded-2xl bg-[#0A1621]/70 ring-1 ring-white/10 p-4 overflow-hidden">
      <div className="mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15 ring-1 ring-cyan-400/30 text-cyan-300">
        {icon}
      </div>
      <div className="text-[15px] font-medium">{title}</div>
      <div className="text-sm text-slate-300/80">{desc}</div>
      <div className="pointer-events-none absolute -bottom-12 -right-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(39,176,255,.22),transparent_60%)] blur-lg opacity-0 group-hover:opacity-100 transition" />
    </div>
  );
}

function MoneyModules3D() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ModuleCard className="from-[#18FFC7] via-[#27B0FF] to-[#B66BFF]">
          <div className="text-sm opacity-70">Text message</div>
          <div className="mt-2 inline-block rounded-2xl bg-white/10 px-3 py-2">gm fren 👋</div>
        </ModuleCard>
        <ModuleCard className="from-emerald-400/80 to-cyan-400/80">
          <div className="text-sm opacity-70">ETH transfer</div>
          <div className="mt-1 text-emerald-300 font-medium">0.01 ETH</div>
          <div className="text-sm opacity-80">“thanks for the help”</div>
        </ModuleCard>
        <ModuleCard className="from-sky-400/80 to-violet-400/80">
          <div className="text-sm opacity-70">IPFS media</div>
          <div className="mt-1 text-sky-300 font-medium">cid: bafy...a12</div>
          <div className="text-sm opacity-80">image/video/audio</div>
        </ModuleCard>
      </div>
    </section>
  );
}
function ModuleCard({ className = "", children }) {
  return (
    <div className={`module3d rounded-2xl p-[2px] bg-gradient-to-br ${className}`}>
      <div className="rounded-2xl bg-[#0A1621]/80 p-4">{children}</div>
    </div>
  );
}

function Timeline3D() {
  const steps = [
    { t: "Connect wallet", d: "Authenticate with your wallet — no email, no password." },
    { t: "Create on-chain account", d: "Register your display name and optional IPFS avatar." },
    { t: "Add a friend", d: "Permissioned friend list lives in your contract storage." },
    { t: "Chat & transfer", d: "Send text, media (IPFS), and ETH/tokens with memos." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 pb-10">
      <div className="grid grid-cols-12 gap-6">
        <div className="module3d col-span-12 lg:col-span-4">
          <h2 className="text-xl sm:text-2xl font-semibold">How it works</h2>
          <p className="mt-2 text-slate-300/80">Four steps to a fully on-chain chat experience.</p>
        </div>
        <ol className="module3d depth-1 col-span-12 lg:col-span-8 relative ml-2 border-l border-white/10">
          {steps.map((s, i) => (
            <li key={s.t} className="relative pl-6 pb-5 last:pb-0">
              <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 shadow-[0_0_18px_rgba(59,130,246,.6)]" />
              <div className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10 hover:ring-cyan-400/40 transition">
                <div className="text-xs uppercase tracking-wide text-slate-400">Step {i + 1}</div>
                <div className="mt-1 font-medium">{s.t}</div>
                <div className="text-sm text-slate-300/80">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PreviewStack() {
  return (
    <div className="relative h-[360px] md:h-[420px] [transform-style:preserve-3d]">
      <div className="absolute -inset-8 rounded-[22px] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(39,176,255,.25),transparent_70%)] blur-xl" />
      <Layer angle={-6} depth={-60}><Bubble mine text="gm fren 👋" sub="now • you" /></Layer>
      <Layer angle={5} depth={-30}><Bubble text="hey! try token tip?" sub="now • friend" /></Layer>
      <Layer angle={-3} depth={0}><Transfer amount="0.01 ETH" note="thanks for the help 🙌" /></Layer>
      <Layer angle={8} depth={40}><Media cid="bafy...a12" /></Layer>
    </div>
  );
}
function Layer({ angle = 0, depth = 0, children }) {
  return (
    <div
      className="absolute left-4 right-4 md:left-8 md:right-8 rounded-2xl p-[2px] bg-gradient-to-br from-[#18FFC7] via-[#27B0FF] to-[#B66BFF] shadow-[0_14px_52px_rgba(39,176,255,.25)]"
      style={{ top: `calc(10% + ${depth / 4}px)`, transform: `translateZ(${depth}px) rotate(${angle}deg)` }}
    >
      <div className="rounded-2xl bg-[#0A1621]/80 backdrop-blur-xl p-3.5">{children}</div>
    </div>
  );
}
function Bubble({ text, sub, mine }) {
  return (
    <div className={`max-w-full ${mine ? "ml-auto text-right" : ""}`}>
      <div className="mb-1 text-[11px] opacity-60">{sub}</div>
      <div className={`inline-block rounded-2xl px-3 py-2 ${mine ? "bg-white/20" : "bg-white/10"}`}>{text}</div>
    </div>
  );
}
function Transfer({ amount, note }) {
  return (
    <div className="rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/30 p-3">
      <div className="text-xs opacity-70">ETH transfer</div>
      <div className="mt-1 font-medium text-emerald-300">{amount}</div>
      <div className="text-sm opacity-80">{note}</div>
    </div>
  );
}
function Media({ cid }) {
  return (
    <div className="rounded-2xl bg-sky-400/10 ring-1 ring-sky-400/30 p-3">
      <div className="text-xs opacity-70">IPFS media</div>
      <div className="mt-1 font-medium text-sky-300">cid: {cid}</div>
      <div className="text-sm opacity-80">image/video/audio</div>
    </div>
  );
}
