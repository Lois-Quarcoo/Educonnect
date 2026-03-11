import * as DocumentPicker from 'expo-document-picker';
import { uploadImage } from './cloudinary';

export interface UploadedMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
  userId: string;
}

// Pick and upload document
export const pickAndUploadDocument = async (userId: string): Promise<UploadedMaterial | null> => {
  try {
    // Pick document
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'image/*',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    
    // Upload to Cloudinary
    const uploadedUrl = await uploadImage(asset.uri, `materials/${userId}`);
    
    const material: UploadedMaterial = {
      id: Date.now().toString(),
      name: asset.name,
      type: getMaterialType(asset.mimeType || asset.name),
      url: uploadedUrl,
      size: asset.size || 0,
      uploadedAt: new Date(),
      userId,
    };

    return material;
  } catch (error) {
    console.error('Document upload error:', error);
    throw new Error('Failed to upload document');
  }
};

// Determine material type from MIME type or file name
const getMaterialType = (mimeTypeOrName: string): 'pdf' | 'image' | 'document' | 'other' => {
  const lower = mimeTypeOrName.toLowerCase();
  
  if (lower.includes('pdf')) return 'pdf';
  if (lower.includes('image') || lower.includes('jpg') || lower.includes('png') || lower.includes('gif')) return 'image';
  if (lower.includes('text') || lower.includes('document') || lower.includes('word') || lower.includes('doc')) return 'document';
  
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

// Get material icon based on type
export const getMaterialIcon = (type: string): string => {
  switch (type) {
    case 'pdf': return '📄';
    case 'image': return '🖼️';
    case 'document': return '📝';
    default: return '📎';
  }
};
