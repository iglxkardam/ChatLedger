// components/Auth/CreateAccount.js
import { useEffect, useRef, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import {
  FiUser,
  FiCheck,
  FiArrowRight,
  FiZap,
  FiShield,
  FiCpu,
  FiLoader,
} from "react-icons/fi";

const MAX_LEN = 30;

/* ---------------------- Animated bottom band ---------------------- */
function LedgerStripInline({
  height = 260,
  hueA = 172,
  hueB = 268,
  blocks = 20,
  speed = 0.12,
}) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

    let W = 0, H = height;
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

    const rows = Math.max(6, Math.min(12, Math.floor(H / 28)));
    const blockList = Array.from({ length: blocks }).map((_, i) => {
      const row = (i % rows) + 0.5;
      const dir = Math.random() > 0.5 ? 1 : -1;
      const w = 80 + Math.random() * 140;
      return {
        x: Math.random() * W,
        y: (row / rows) * H,
        w,
        h: 16 + Math.random() * 8,
        v: (speed + Math.random() * speed) * dir,
        hue: lerp(hueA, hueB, Math.random()),
      };
    });

    const roundedRect = (x, y, w, h, r) => {
      const rr = Math.min(r, h / 2, w / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };

    let t = 0, raf = 0;

    const drawWave = (yOffset, amp, freq, alpha, hueShift = 0) => {
      const g = ctx.createLinearGradient(0, 0, W, 0);
      const h1 = (hueA + hueShift) % 360;
      const h2 = (hueB + hueShift) % 360;
      g.addColorStop(0, `hsla(${h1}, 100%, 65%, ${alpha})`);
      g.addColorStop(1, `hsla(${h2}, 100%, 65%, ${alpha})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W;
        const y = yOffset + Math.sin(i * freq + t) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.lineWidth = 8;
      ctx.globalAlpha = alpha * 0.25;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      const bg = ctx.createRadialGradient(W * 0.6, H * 0.2, 30, W * 0.6, H * 0.2, H * 1.2);
      bg.addColorStop(0, "rgba(9,18,35,0.35)");
      bg.addColorStop(1, "rgba(6,8,14,0.95)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";
      drawWave(H * 0.25, 18, 0.28, 0.9, 0);
      drawWave(H * 0.48, 24, 0.23, 0.8, 16);
      drawWave(H * 0.72, 16, 0.35, 0.7, 32);

      for (const b of blockList) {
        b.x += b.v;
        if (b.v > 0 && b.x - b.w > W + 20) b.x = -20;
        if (b.v < 0 && b.x + b.w < -20) b.x = W + 20;

        const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y);
        grad.addColorStop(0, `hsla(${b.hue}, 100%, 70%, .85)`);
        grad.addColorStop(1, `hsla(${(b.hue + 60) % 360}, 100%, 70%, .85)`);
        ctx.fillStyle = grad;

        roundedRect(b.x, b.y - b.h / 2, b.w, b.h, 10);
        ctx.fill();

        ctx.lineWidth = 6;
        ctx.strokeStyle = `hsla(${b.hue}, 100%, 70%, .18)`;
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `hsla(${(b.hue + 20) % 360}, 100%, 70%, .9)`;
        ctx.arc(b.x + (b.v > 0 ? b.w * 0.85 : b.w * 0.15), b.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      t += 0.015;
      raf = requestAnimationFrame(animate);
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [height, hueA, hueB, blocks, speed]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]" style={{ height }} />;
}
const lerp = (a, b, t) => a + (b - a) * t;

/* --------------------------- Component --------------------------- */
export default function CreateAccount({ onAccountCreated }) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // success -> notify parent (this is what flips to Dashboard in your index.js)
  useEffect(() => {
    if (!isConfirmed) return;
    toast.success("Account created successfully!");
    setIsLoading(false);

    // Robust notify: call once, and also trigger a microtask to ensure wagmi refetch runs
    try { onAccountCreated?.(); } catch {}
    queueMicrotask(() => { try { onAccountCreated?.(); } catch {} });
  }, [isConfirmed, onAccountCreated]);

  // tx error
  useEffect(() => {
    if (!error) return;
    toast.error("Failed to create account");
    console.error(error);
    setIsLoading(false);
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = (username || "").trim();
    if (!name) return toast.error("Please enter a valid username");
    if (name.length > MAX_LEN) return toast.error(`Keep it under ${MAX_LEN} chars`);
    try {
      setIsLoading(true);
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ChatAppABI,
        functionName: "createAccount",
        args: [name],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create account");
      setIsLoading(false);
    }
  };

  // 3D tilt for the hologram card
  const holoRef = useRef(null);
  useEffect(() => {
    const el = holoRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const px = x / r.width - 0.5;
      const py = y / r.height - 0.5;
      el.style.setProperty("--rx", `${py * -8}deg`);
      el.style.setProperty("--ry", `${px * 10}deg`);
      el.style.setProperty("--tx", `${px * 6}px`);
      el.style.setProperty("--ty", `${py * 6}px`);
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--tx", "0px");
      el.style.setProperty("--ty", "0px");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const busy = isLoading || isPending || isConfirming;
  const used = Math.min(MAX_LEN, (username || "").length);
  const pct = Math.min(100, Math.round((used / MAX_LEN) * 100));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06080E] text-slate-100">
      {/* content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:py-14 pb-28">
        {/* top bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#18FFC7] via-[#27B0FF] to-[#B66BFF]" />
            <div className="font-semibold">Create your on-chain ID</div>
          </div>
          <div className="hidden text-xs text-slate-400 md:block">
            Everything you set here is saved by your{" "}
            <span className="text-cyan-300">Storledger</span> contract
          </div>
        </div>

        {/* split layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* left: form */}
          <section className="col-span-12 md:col-span-6 lg:col-span-5">
            <div className="mb-5 flex items-center gap-3">
              <Badge icon={<FiCheck />} label="Connected" />
              <span className="h-px w-6 bg-white/10" />
              <Badge active icon={<FiUser />} label="Create account" />
              <span className="h-px w-6 bg-white/10" />
              <Badge icon={<FiShield />} label="Secure & private" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <h1 className="text-2xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-[#18FFC7] via-[#27B0FF] to-[#B66BFF] bg-clip-text text-transparent">
                  Pick a username
                </span>
              </h1>
              <p className="mt-1 text-slate-300/80">
                This will be shown to your friends. You can change it later.
              </p>

              <div className="mt-5">
                <label htmlFor="username" className="mb-2 block text-sm text-slate-300/80">
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 grid w-6 place-items-center opacity-70">
                    <FiUser />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    maxLength={MAX_LEN}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. zk_fren"
                    className="w-full rounded-xl border border-white/10 bg-[#0A1621]/70 px-10 py-3.5 text-[15px] outline-none ring-0 transition focus:border-cyan-400/50"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="h-1 w-full rounded-full bg-white/10">
                    <div
                      className="h-1 rounded-full bg-gradient-to-r from-[#18FFC7] via-[#27B0FF] to-[#B66BFF] transition-[width]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="ml-3 text-xs text-slate-400">
                    {used}/{MAX_LEN}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-300/80">
                <MiniFeature icon={<FiShield />} title="Permissioned friends" />
                <MiniFeature icon={<FiZap />} title="Instant events" />
                <MiniFeature icon={<FiCpu />} title="IPFS media ready" />
              </div>

              <button
                type="submit"
                disabled={busy || !(username || "").trim()}
                className="
                  group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl
                  bg-gradient-to-r from-[#18FFC7] via-[#27B0FF] to-[#B66BFF]
                  px-5 py-3.5 text-[15px] font-semibold text-[#061018]
                  shadow-[0_16px_48px_rgba(39,176,255,.35)]
                  transition hover:translate-y-[-1px] hover:shadow-[0_20px_60px_rgba(39,176,255,.45)]
                  disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none
                "
              >
                {busy ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>
                      {isPending
                        ? "Confirm in wallet…"
                        : isConfirming
                        ? "Finalizing on-chain…"
                        : "Creating…"}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {hash && (
                <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-200">
                  Transaction submitted. Waiting for confirmations…
                </div>
              )}
            </form>
          </section>

          {/* right: hologram identity card */}
          <section className="col-span-12 md:col-span-6 lg:col-span-7">
            <div
              ref={holoRef}
              className="group relative h-[380px] w-full select-none rounded-[26px] p-[2px] [perspective:1200px]
                         transition-transform duration-300"
              style={{
                transform:
                  "rotateX(var(--rx,0)) rotateY(var(--ry,0)) translateX(var(--tx,0)) translateY(var(--ty,0))",
              }}
            >
              <div className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-[#18FFC7] via-[#27B0FF] to-[#B66BFF] opacity-80 blur-[6px]" />
              <div className="relative h-full w-full rounded-[26px] border border-white/10 bg-[#07121A]/70 backdrop-blur-xl overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent,transparent_96%,rgba(255,255,255,.12)_96%,rgba(255,255,255,.12)_100%)] bg-[length:100%_38px] animate-[scan_3.8s_linear_infinite]" />
                <Corner x="left-4" y="top-4" />
                <Corner x="right-4" y="top-4" />
                <Corner x="left-4" y="bottom-4" />
                <Corner x="right-4" y="bottom-4" />

                <div className="relative z-10 grid h-full grid-cols-12 gap-6 p-6 md:p-8">
                  <div className="col-span-12 sm:col-span-4">
                    <div className="relative mx-auto h-36 w-36 rounded-3xl bg-gradient-to-br from-[#18FFC7] via-[#27B0FF] to-[#B66BFF] p-[2px]">
                      <div className="flex h-full w-full items-center justify-center rounded-3xl bg-[#091523]">
                        <FiUser className="text-cyan-200" size={36} />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        on-chain identity
                      </div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {username || "your_name"}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-8">
                    <HoloRow label="Status" value={busy ? "processing…" : "ready"} ok={!busy} />
                    <HoloRow label="Network" value="EVM (wallet)" />
                    <HoloRow label="Storage" value="Contract state + IPFS (media)" />
                    <HoloRow label="Privacy" value="Permissioned friends" />
                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      Live security checks enabled
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Chip label="AVAX transfer ready" />
              <Chip label="IPFS media supported" />
              <Chip label="Friends & permissions" />
            </div>
          </section>
        </div>
      </div>

      <LedgerStripInline height={260} />

      <style jsx>{`
        @keyframes scan {
          0% { background-position-y: 0; }
          100% { background-position-y: 100%; }
        }
      `}</style>
    </div>
  );
}

/* --------------------------- tiny helpers --------------------------- */
function Badge({ icon, label, active }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
        active
          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
          : "border-white/10 bg-white/5 text-slate-300/80"
      }`}
    >
      <span className="grid h-4 w-4 place-items-center">{icon}</span>
      {label}
    </div>
  );
}
function MiniFeature({ icon, title }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-cyan-300">{icon}</span>
      <span>{title}</span>
    </div>
  );
}
function Corner({ x, y }) {
  return <div className={`absolute ${x} ${y} h-3 w-3 rounded-full bg-gradient-to-br from-[#18FFC7] to-[#27B0FF]`} />;
}
function HoloRow({ label, value, ok }) {
  return (
    <div className="mb-3 grid grid-cols-12 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="col-span-4 text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="col-span-7 text-sm text-slate-200">{value}</div>
      <div className="col-span-1 grid place-items-center">
        {ok ? <FiCheck className="text-emerald-400" /> : <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />}
      </div>
    </div>
  );
}
function Chip({ label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-slate-300/90">
      {label}
    </div>
  );
}
