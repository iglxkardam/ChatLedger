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
          gradient: "from-blue-50 to-blue-100",
          border: "border-blue-200",
          iconBg: "bg-blue-500",
          iconColor: "text-blue-600",
          bgColor: "bg-blue-50",
          textColor: "text-blue-900",
        };
      case FiMessageCircle:
        return {
          gradient: "from-green-50 to-green-100",
          border: "border-green-200",
          iconBg: "bg-green-500",
          iconColor: "text-green-600",
          bgColor: "bg-green-50",
          textColor: "text-green-900",
        };
      case FiDollarSign:
        return {
          gradient: "from-purple-50 to-purple-100",
          border: "border-purple-200",
          iconBg: "bg-purple-500",
          iconColor: "text-purple-600",
          bgColor: "bg-purple-50",
          textColor: "text-purple-900",
        };
      case FiTrendingUp:
        return {
          gradient: "from-orange-50 to-orange-100",
          border: "border-orange-200",
          iconBg: "bg-orange-500",
          iconColor: "text-orange-600",
          bgColor: "bg-orange-50",
          textColor: "text-orange-900",
        };
      default:
        return {
          gradient: "from-gray-50 to-gray-100",
          border: "border-gray-200",
          iconBg: "bg-gray-500",
          iconColor: "text-gray-600",
          bgColor: "bg-gray-50",
          textColor: "text-gray-900",
        };
    }
  };

  const tone = toneForIcon();
  const isPositive = changeType !== "negative";
  const TrendIcon = isPositive ? FiTrendingUp : FiTrendingDown;

  return (
    <div className="group relative">
      {/* Card */}
      <div
        className={`relative rounded-lg border ${tone.border} ${tone.bgColor}
        p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
        aria-label={`${title} stat card`}
      >
        {/* Content */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: text */}
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-medium text-gray-600">{title}</p>

            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {value}
              </p>
              <div
                className={`h-0.5 w-full rounded-full ${tone.iconBg} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
              />
            </div>

            {change && (
              <div
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border
                ${
                  isPositive
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
                aria-label={`Change: ${change}`}
              >
                <TrendIcon
                  size={12}
                  className={`${
                    isPositive ? "text-green-600" : "text-red-600"
                  } transition-transform duration-300 group-hover:scale-110`}
                />
                <span
                  className={`text-xs font-medium ${
                    isPositive ? "text-green-800" : "text-red-800"
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
              className={`relative grid h-12 w-12 place-items-center rounded-lg border ${tone.border}
              ${tone.iconBg} shadow-sm
              transition-transform duration-200 group-hover:scale-105`}
              aria-hidden="true"
            >
              <Icon size={20} className="text-white relative z-10" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StatsCard;
