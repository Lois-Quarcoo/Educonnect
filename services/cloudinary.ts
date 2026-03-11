// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "ds5ovthng";
const CLOUDINARY_UPLOAD_PRESET = "educonnect";
const CLOUDINARY_API_KEY = "269127892391871";

// Upload image to Cloudinary using fetch API
export const uploadImage = async (
  imageUri: string,
  folder: string = "educonnect",
): Promise<string> => {
  try {
    // Create a unique filename
    const filename = `user_${Date.now()}`;

    // Create form data for upload
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: filename,
    } as any);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);
    formData.append("public_id", filename);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Requested-With": "XMLHttpRequest",
          Authorization: `Basic ${btoa(`${CLOUDINARY_API_KEY}:JX2O-ZQ_jxZvbPI5GJb4BaiTRUI`)}`,
        },
      },
    );

    const data = await response.json();

    if (data.secure_url) {
      console.log("Cloudinary upload successful:", data.secure_url);
      return data.secure_url;
    } else {
      throw new Error(
        data.error?.message || "Failed to upload image to Cloudinary",
      );
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed. Please try again.");
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    const timestamp = Date.now();
    const signature = generateDeleteSignature(publicId, timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${CLOUDINARY_API_KEY}:JX2O-ZQ_jxZvbPI5GJb4BaiTRUI`)}`,
        },
        body: JSON.stringify({
          public_id: publicId,
          timestamp,
          signature,
          api_key: CLOUDINARY_API_KEY,
        }),
      },
    );

    const data = await response.json();

    if (data.result === "ok") {
      console.log("Cloudinary delete successful:", publicId);
    } else {
      throw new Error("Failed to delete image from Cloudinary");
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image. Please try again.");
  }
};

// Generate signature for delete operations
const generateDeleteSignature = (
  publicId: string,
  timestamp: number,
): string => {
  // This is a simplified signature generation
  // In production, you should use a proper crypto library
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  return btoa(stringToSign).replace(/[^a-zA-Z0-9]/g, "");
};

// Get user avatar public ID from URL
export const getPublicIdFromUrl = (url: string): string => {
  // Extract public_id from Cloudinary URL
  // Example: https://res.cloudinary.com/ds5ovthng/image/upload/v1234567890/user_1234567890.jpg
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const publicId = filename.split(".")[0];
  return publicId;
};
