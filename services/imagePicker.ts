import * as ImagePicker from "expo-image-picker";

// Request camera and photo library permissions
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return (
      cameraPermission.status === "granted" &&
      mediaLibraryPermission.status === "granted"
    );
  } catch (error) {
    console.error("Camera permission error:", error);
    return false;
  }
};

// Pick image from gallery
export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    // Request permissions first
    const hasPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (hasPermission.status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      console.log("Selected image from gallery:", imageUri);
      return imageUri;
    }

    return null;
  } catch (error) {
    console.error("Gallery picker error:", error);
    throw new Error("Failed to pick image from gallery");
  }
};

// Take photo with camera
export const takePhotoWithCamera = async (): Promise<string | null> => {
  try {
    // Request permissions first
    const hasPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (hasPermission.status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      console.log("Photo taken with camera:", imageUri);
      return imageUri;
    }

    return null;
  } catch (error) {
    console.error("Camera picker error:", error);
    throw new Error("Failed to take photo with camera");
  }
};

// Show image selection options
export const showImagePickerOptions = async (): Promise<string | null> => {
  try {
    // For simplicity, just open the gallery
    return await pickImageFromGallery();
  } catch (error) {
    console.error("Image picker error:", error);
    throw new Error("Failed to select image");
  }
};
