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
      
      // Add a delay to allow blockchain to update before refetching
      setTimeout(() => {
        onUpdate();
      }, 2000);
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
          {/* Picture frame with clean border */}
          <div className="relative w-40 h-40 bg-gray-100 rounded-full p-1 shadow-lg border-2 border-gray-200">
            <div className="relative w-full h-full bg-white rounded-full overflow-hidden">
              <img
                src={
                  previewUrl ||
                  (currentProfilePicture
                    ? getIPFSUrl(currentProfilePicture)
                    : "/logo.png")
                }
                alt="Profile"
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.log("Profile image error:", e.target.src);
                  e.target.src = "/logo.png";
                }}
                onLoad={() => {
                  console.log("Profile image loaded successfully:", currentProfilePicture);
                }}
              />

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiLoader
                        className="text-blue-500 animate-pulse"
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
                w-12 h-12 bg-blue-500 
                hover:bg-blue-600 
                text-white rounded-full 
                shadow-lg 
                transition-all duration-300 
                hover:scale-110 active:scale-95
                disabled:opacity-50 disabled:scale-100
                flex items-center justify-center
                border-2 border-white
              "
            >
              <FiCamera size={18} />
            </button>

            {/* Success indicator */}
            {isConfirmed && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                <FiCheck className="text-white" size={14} />
              </div>
            )}
          </div>

          {/* Status text */}
          <div className="mt-4 text-center">
            <p className="text-gray-900 font-semibold text-lg">Profile Picture</p>
            <p className="text-gray-600 text-sm">
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
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-300
            ${
              dragOver
                ? "border-blue-500 bg-blue-50 scale-105"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
            }
          `}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto border border-blue-200">
              <FiImage className="text-blue-500" size={28} />
            </div>

            <div>
              <p className="text-gray-900 font-semibold mb-2">
                {dragOver ? "Drop image here" : "Drag & drop an image"}
              </p>
              <p className="text-gray-600 text-sm">or click to browse files</p>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p>• Supported: JPG, PNG, GIF, WebP</p>
              <p>• Maximum size: 5MB</p>
              <p>• Recommended: Square images work best</p>
            </div>
          </div>
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
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                <FiImage className="text-green-600" size={18} />
              </div>
              <div>
                <p className="text-gray-900 font-semibold">{selectedFile.name}</p>
                <p className="text-gray-600 text-sm">
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
                bg-gray-100 
                border border-gray-300 text-gray-700 
                rounded-xl hover:bg-gray-200 hover:text-gray-900 
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
                bg-blue-500 
                hover:bg-blue-600 
                text-white rounded-xl 
                transition-all duration-300 
                flex items-center justify-center space-x-2
                shadow-lg
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200 mt-0.5">
            <FiShield className="text-blue-600" size={16} />
          </div>
          <div>
            <p className="text-blue-900 font-semibold text-sm mb-1">
              Secure Storage
            </p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Your profile picture is stored on IPFS (InterPlanetary File
              System) and linked to your blockchain identity. This ensures
              decentralized, permanent storage of your image.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePictureUpload;
