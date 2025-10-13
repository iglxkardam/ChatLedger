import axios from "axios";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export const uploadToPinata = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size,
      },
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${PINATA_JWT}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getIPFSUrl = (hash) => {
  // Use multiple gateways for better reliability
  const gateways = [
    `https://ipfs.io/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
  ];
  
  // Return the first gateway (ipfs.io is generally more reliable)
  return gateways[0];
};
