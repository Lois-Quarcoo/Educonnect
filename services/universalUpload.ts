import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from './cloudinary';

export type UploadType = 'image' | 'document' | 'any';
export type UploadResult = {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
  mimeType?: string;
};

// Universal upload function that can handle images, documents, or any files
export const uploadFile = async (
  userId: string,
  uploadType: UploadType = 'any',
  folder: string = 'uploads'
): Promise<UploadResult | null> => {
  try {
    let result: DocumentPicker.DocumentPickerResult | ImagePicker.ImagePickerResult;
    let fileUri: string;
    let fileName: string;
    let fileSize: number;
    let mimeType: string | undefined;

    if (uploadType === 'image') {
      // Use image picker for images only
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        throw new Error('Camera roll permissions are required');
      }

      const imageResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (imageResult.canceled || !imageResult.assets || imageResult.assets.length === 0) {
        return null;
      }

      const asset = imageResult.assets[0];
      fileUri = asset.uri;
      fileName = asset.fileName || `image_${Date.now()}.jpg`;
      fileSize = asset.fileSize || 0;
      mimeType = asset.mimeType;
    } else {
      // Use document picker for documents or any files
      const mimeTypes = uploadType === 'document' 
        ? ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        : ['*/*'];

      const docResult = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (docResult.canceled || !docResult.assets || docResult.assets.length === 0) {
        return null;
      }

      const asset = docResult.assets[0];
      fileUri = asset.uri;
      fileName = asset.name;
      fileSize = asset.size || 0;
      mimeType = asset.mimeType;
    }

    // Upload to Cloudinary
    const uploadedUrl = await uploadImage(fileUri, `${folder}/${userId}`);

    const uploadResult: UploadResult = {
      id: Date.now().toString(),
      name: fileName,
      type: getFileType(fileName, mimeType),
      url: uploadedUrl,
      size: fileSize,
      uploadedAt: new Date(),
      mimeType,
    };

    return uploadResult;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
};

// Determine file type from name or MIME type
const getFileType = (fileName: string, mimeType?: string): 'image' | 'pdf' | 'document' | 'other' => {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType?.toLowerCase() || '';

  if (lowerMime.includes('image') || lowerName.includes('.jpg') || lowerName.includes('.png') || lowerName.includes('.gif')) {
    return 'image';
  }
  if (lowerMime.includes('pdf') || lowerName.includes('.pdf')) {
    return 'pdf';
  }
  if (lowerMime.includes('text') || lowerMime.includes('document') || lowerName.includes('.doc') || lowerName.includes('.txt')) {
    return 'document';
  }
  
  return 'other';
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on type
export const getFileIcon = (type: string): string => {
  switch (type) {
    case 'pdf': return '📄';
    case 'image': return '🖼️';
    case 'document': return '📝';
    default: return '📎';
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (
  userId: string,
  uploadType: UploadType = 'any',
  folder: string = 'uploads'
): Promise<UploadResult[]> => {
  try {
    const mimeTypes = uploadType === 'document' 
      ? ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      : uploadType === 'image'
      ? ['image/*']
      : ['*/*'];

    const result = await DocumentPicker.getDocumentAsync({
      type: mimeTypes,
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    const uploadPromises = result.assets.map(async (asset) => {
      const uploadedUrl = await uploadImage(asset.uri, `${folder}/${userId}`);
      
      return {
        id: Date.now().toString() + Math.random(),
        name: asset.name,
        type: getFileType(asset.name, asset.mimeType),
        url: uploadedUrl,
        size: asset.size || 0,
        uploadedAt: new Date(),
        mimeType: asset.mimeType,
      } as UploadResult;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload files');
  }
};
