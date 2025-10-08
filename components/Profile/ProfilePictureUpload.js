import { useState, useRef, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import {
  FiCamera,
  FiUpload,
  FiLoader,
  FiX,
  FiImage,
  FiCheck,
  FiShield,
} from "react-icons/fi";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import { uploadToPinata, getIPFSUrl } from "../../utils/pinata";

const ProfilePictureUpload = ({
  currentProfilePicture,
  userAddress,
  onUpdate,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle successful profile picture update
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Profile picture updated successfully!");
      setPreviewUrl(null);
      setSelectedFile(null);
      onUpdate();
    }
  }, [isConfirmed, onUpdate]);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUploadAndUpdate = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      // Upload to Pinata
      const result = await uploadToPinata(selectedFile);

      if (result.success) {
        // Update profile picture in smart contract
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: ChatAppABI,
          functionName: "updateProfilePicture",
          args: [result.ipfsHash],
        });
      } else {
        toast.error("Failed to upload image to IPFS");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isLoading = uploading || isPending || isConfirming;

  return (
    <div className="relative space-y-6">
      {/* Profile Picture Container */}
      <div className="flex flex-col items-center">
        {/* Main Profile Picture */}
        <div className="relative group">
          {/* Picture frame with gradient border */}
          <div className="relative w-40 h-40 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-full p-1 shadow-2xl shadow-purple-600/20">
            <div className="relative w-full h-full bg-[#0E0B12] rounded-full overflow-hidden border-2 border-fuchsia-500/30">
              <img
                src={
                  previewUrl ||
                  (currentProfilePicture
                    ? getIPFSUrl(currentProfilePicture)
                    : "/logo.png")
                }
                alt="Profile"
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = "/logo.png";
                }}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-[#0E0B12]/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiLoader
                        className="text-fuchsia-400 animate-pulse"
                        size={20}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="
                absolute bottom-2 right-2 
                w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-purple-600 
                hover:from-fuchsia-600 hover:to-purple-700 
                text-white rounded-full 
                shadow-lg shadow-fuchsia-500/30 
                hover:shadow-xl hover:shadow-purple-500/40
                transition-all duration-300 
                hover:scale-110 active:scale-95
                disabled:opacity-50 disabled:scale-100
                flex items-center justify-center
                border-2 border-white/20
              "
            >
              <FiCamera size={18} />
            </button>

            {/* Success indicator */}
            {isConfirmed && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-[#0E0B12] flex items-center justify-center animate-bounce">
                <FiCheck className="text-white" size={14} />
              </div>
            )}
          </div>

          {/* Status text */}
          <div className="mt-4 text-center">
            <p className="text-white font-medium">Profile Picture</p>
            <p className="text-gray-400 text-sm">
              {isLoading
                ? uploading
                  ? "Uploading to IPFS..."
                  : "Updating on blockchain..."
                : "Click camera to update"}
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Zone (when no file selected) */}
      {!selectedFile && !isLoading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-300 backdrop-blur-sm
            ${
              dragOver
                ? "border-fuchsia-500/60 bg-fuchsia-500/10 scale-105"
                : "border-fuchsia-500/30 bg-gradient-to-br from-[#0E0B12]/40 to-[#0E0B12]/20 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5"
            }
          `}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto border border-fuchsia-500/30">
              <FiImage className="text-fuchsia-400" size={28} />
            </div>

            <div>
              <p className="text-white font-medium mb-2">
                {dragOver ? "Drop image here" : "Drag & drop an image"}
              </p>
              <p className="text-gray-400 text-sm">or click to browse files</p>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Supported: JPG, PNG, GIF, WebP</p>
              <p>• Maximum size: 5MB</p>
              <p>• Recommended: Square images work best</p>
            </div>
          </div>

          {/* Animated background elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-fuchsia-400/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400/40 rounded-full animate-ping"></div>
        </div>
      )}

      {/* File input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Action buttons when file is selected */}
      {selectedFile && !isLoading && (
        <div className="space-y-4">
          {/* File info */}
          <div className="bg-gradient-to-r from-[#0E0B12]/60 to-[#0E0B12]/40 backdrop-blur-sm rounded-xl border border-fuchsia-500/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <FiImage className="text-green-400" size={18} />
              </div>
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={cancelSelection}
              className="
                flex-1 px-4 py-3 
                bg-gradient-to-r from-[#0E0B12]/60 to-[#0E0B12]/40 
                border border-fuchsia-500/20 text-gray-300 
                rounded-xl hover:bg-fuchsia-500/10 hover:text-white 
                transition-all duration-300 
                flex items-center justify-center space-x-2
              "
            >
              <FiX size={16} />
              <span>Cancel</span>
            </button>

            <button
              onClick={handleUploadAndUpdate}
              className="
                flex-1 px-4 py-3 
                bg-gradient-to-r from-fuchsia-500 to-purple-600 
                hover:from-fuchsia-600 hover:to-purple-700 
                text-white rounded-xl 
                transition-all duration-300 
                flex items-center justify-center space-x-2
                shadow-lg shadow-fuchsia-500/30
                hover:shadow-xl hover:shadow-purple-500/40
                hover:scale-105 active:scale-95
              "
            >
              <FiUpload size={16} />
              <span>Update Picture</span>
            </button>
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center border border-blue-500/30 mt-0.5">
            <FiShield className="text-blue-400" size={16} />
          </div>
          <div>
            <p className="text-blue-300 font-medium text-sm mb-1">
              Secure Storage
            </p>
            <p className="text-blue-200/80 text-xs leading-relaxed">
              Your profile picture is stored on IPFS (InterPlanetary File
              System) and linked to your blockchain identity. This ensures
              decentralized, permanent storage of your image.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Enhanced hover effects */
        @keyframes profile-glow {
          0%,
          100% {
            box-shadow: 0 0 30px rgba(217, 70, 239, 0.2);
          }
          50% {
            box-shadow: 0 0 50px rgba(217, 70, 239, 0.4);
          }
        }

        .group:hover .relative {
          animation: profile-glow 2s ease-in-out infinite;
        }

        /* Drag and drop animations */
        @keyframes drag-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .drag-active {
          animation: drag-bounce 0.6s ease-in-out infinite;
        }

        /* File upload progress */
        @keyframes upload-pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .upload-progress {
          animation: upload-pulse 1.5s ease-in-out infinite;
        }

        /* Focus enhancements */
        button:focus {
          outline: 2px solid rgba(217, 70, 239, 0.6);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default ProfilePictureUpload;
