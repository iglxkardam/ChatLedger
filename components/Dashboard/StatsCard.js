import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiMessageCircle,
  FiDollarSign,
} from "react-icons/fi";

/**
 * Props (unchanged)
 * - title: string
 * - value: string | number | ReactNode
 * - icon: React component (e.g., FiUsers)
 * - change: string (e.g., "+2 this week")
 * - changeType: "positive" | "negative"
 */
const StatsCard = ({ title, value, icon: Icon, change, changeType }) => {
  // Map icon -> tone (keeps your current API)
  const toneForIcon = () => {
    switch (Icon) {
      case FiUsers:
        return {
          gradient: "from-blue-500/20 to-cyan-600/20",
          border: "border-blue-500/30",
          iconBg: "from-blue-500/30 to-cyan-600/30",
          iconColor: "text-blue-400",
          glow: "shadow-blue-500/20",
        };
      case FiMessageCircle:
        return {
          gradient: "from-fuchsia-500/20 to-pink-600/20",
          border: "border-fuchsia-500/30",
          iconBg: "from-fuchsia-500/30 to-pink-600/30",
          iconColor: "text-fuchsia-400",
          glow: "shadow-fuchsia-500/20",
        };
      case FiDollarSign:
        return {
          gradient: "from-green-500/20 to-emerald-600/20",
          border: "border-green-500/30",
          iconBg: "from-green-500/30 to-emerald-600/30",
          iconColor: "text-green-400",
          glow: "shadow-green-500/20",
        };
      case FiTrendingUp:
        return {
          gradient: "from-purple-500/20 to-violet-600/20",
          border: "border-purple-500/30",
          iconBg: "from-purple-500/30 to-violet-600/30",
          iconColor: "text-purple-400",
          glow: "shadow-purple-500/20",
        };
      default:
        return {
          gradient: "from-fuchsia-500/20 to-purple-600/20",
          border: "border-fuchsia-500/30",
          iconBg: "from-fuchsia-500/30 to-purple-600/30",
          iconColor: "text-fuchsia-400",
          glow: "shadow-fuchsia-500/20",
        };
    }
  };

  const tone = toneForIcon();
  const isPositive = changeType !== "negative";
  const TrendIcon = isPositive ? FiTrendingUp : FiTrendingDown;

  return (
    <div className="sc-root group relative">
      {/* Card */}
      <div
        className={`relative rounded-2xl border ${tone.border} bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60
        p-6 backdrop-blur-xl shadow-2xl ${tone.glow}
        transition-transform duration-400 hover:scale-[1.03] overflow-hidden`}
        aria-label={`${title} stat card`}
      >
        {/* Decorative layer (subtle + performant) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${tone.gradient} opacity-40`} />
          {/* dots using bg-current (so text color applies to bg) */}
          <div className={`absolute top-4 right-4 h-2 w-2 rounded-full bg-current opacity-40 animate-pulse ${tone.iconColor}`} />
          <div className={`absolute bottom-6 left-6 h-1 w-1 rounded-full bg-current opacity-30 animate-ping delay-1000 ${tone.iconColor}`} />
          {/* fine grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:18px_18px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          {/* Left: text */}
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-medium text-gray-300/90">{title}</p>

            <div className="mb-4">
              <p className="sc-value mb-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {value}
              </p>
              <div
                className={`h-0.5 w-full rounded-full bg-gradient-to-r ${tone.iconBg} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
              />
            </div>

            {change && (
              <div
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur-sm border
                ${
                  isPositive
                    ? "border-green-500/20 bg-green-500/10"
                    : "border-red-500/20 bg-red-500/10"
                }`}
                aria-label={`Change: ${change}`}
              >
                <TrendIcon
                  size={12}
                  className={`${
                    isPositive ? "text-green-400" : "text-red-400"
                  } transition-transform duration-300 group-hover:scale-110`}
                />
                <span
                  className={`text-xs font-medium ${
                    isPositive ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {change}
                </span>
              </div>
            )}
          </div>

          {/* Right: icon */}
          <div className="relative shrink-0">
            <div
              className={`relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border ${tone.border}
              bg-gradient-to-br ${tone.iconBg} shadow-lg ${tone.glow}
              transition-transform duration-400 group-hover:scale-110 group-hover:rotate-[2deg]`}
              aria-hidden="true"
            >
              <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-40 bg-gradient-to-br ${tone.iconBg}`}
              />
              <Icon size={28} className={`${tone.iconColor} relative z-10`} />
              <div className={`sc-rotor absolute inset-0 rounded-2xl opacity-20 bg-gradient-to-r ${tone.iconBg}`} />
            </div>

            {/* status dot */}
            <div
              className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-[#0E0B12] bg-current ${tone.iconColor} animate-pulse`}
            >
              <div className="absolute inset-0.5 rounded-full bg-current animate-ping" />
            </div>
          </div>
        </div>

        {/* Hover soft glow */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${tone.gradient}
          opacity-0 transition-opacity duration-500 group-hover:opacity-15`}
        />
      </div>

      {/* Scoped styles (no globals) */}
      <style jsx>{`
        .sc-root :global(.sc-rotor) {
          animation: sc-spin 8s linear infinite;
        }
        @keyframes sc-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .sc-root :global(.sc-value) {
          animation: sc-fade-up 0.5s ease-out;
        }
        @keyframes sc-fade-up {
          from {
            transform: translateY(8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        /* Reduce motion support */
        @media (prefers-reduced-motion: reduce) {
          .sc-root :global(.sc-rotor) {
            animation: none;
          }
          .sc-root :global(.animate-pulse),
          .sc-root :global(.animate-ping) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsCard;
