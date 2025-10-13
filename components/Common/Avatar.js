import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { getIPFSUrl } from "../../utils/pinata";

const Avatar = ({
  profilePicture,
  name,
  address,
  size = "md",
  className = "",
  showFallback = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-24 h-24",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 48,
  };

  if (profilePicture && !imageError) {
    return (
      <img
        src={getIPFSUrl(profilePicture)}
        alt={`${name}'s profile`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  if (showFallback) {
    return (
      <div
        className={`${sizeClasses[size]} bg-blue-500 rounded-full flex items-center justify-center ${className}`}
      >
        {name ? (
          <span className="text-white font-semibold text-sm">
            {name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <FiUser className="text-white" size={iconSizes[size]} />
        )}
      </div>
    );
  }

  return null;
};

export default Avatar;
