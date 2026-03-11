import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";

export interface PDFDocument {
  id: string;
  name: string;
  uri: string;
  size: number;
  uploadDate: string;
  subject?: string;
}

export class LocalPDFStorage {
  private static readonly STORAGE_KEY = "local_pdfs";

  /**
   * Upload a PDF file to local storage
   */
  static async uploadPDF(subject?: string): Promise<PDFDocument | null> {
    try {
      // Request file picker for PDF files
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];

      // Generate unique ID and document
      const timestamp = Date.now();
      
      // Ask user for subject if not provided
      let selectedSubject = subject;
      if (!selectedSubject) {
        selectedSubject = "General";
      }

      // Create PDF document metadata (using the original URI)
      const pdfDoc: PDFDocument = {
        id: `pdf_${timestamp}`,
        name: asset.name,
        uri: asset.uri, // Use the original URI from document picker
        size: asset.size || 0,
        uploadDate: new Date().toISOString(),
        subject: selectedSubject,
      };

      // Save metadata to AsyncStorage
      await this.saveMetadata(pdfDoc);

      return pdfDoc;
    } catch (error) {
      console.error("Failed to upload PDF:", error);
      Alert.alert("Error", "Failed to upload PDF. Please try again.");
      return null;
    }
  }

  /**
   * Get all locally stored PDFs
   */
  static async getAllPDFs(): Promise<PDFDocument[]> {
    try {
      const stored = await this.getStoredPDFs();
      return stored.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    } catch (error) {
      console.error("Failed to get PDFs:", error);
      return [];
    }
  }

  /**
   * Get PDFs by subject
   */
  static async getPDFsBySubject(subject: string): Promise<PDFDocument[]> {
    try {
      const allPDFs = await this.getAllPDFs();
      return allPDFs.filter(pdf => pdf.subject === subject || (subject === 'All' && pdf));
    } catch (error) {
      console.error("Failed to get PDFs by subject:", error);
      return [];
    }
  }

  /**
   * Get available subjects
   */
  static async getAvailableSubjects(): Promise<string[]> {
    try {
      const pdfs = await this.getAllPDFs();
      const subjects = new Set<string>();
      pdfs.forEach(pdf => {
        if (pdf.subject) {
          subjects.add(pdf.subject);
        }
      });
      return Array.from(subjects).sort();
    } catch (error) {
      console.error("Failed to get available subjects:", error);
      return [];
    }
  }

  /**
   * Delete a PDF by ID
   */
  static async deletePDF(id: string): Promise<boolean> {
    try {
      const stored = await this.getStoredPDFs();
      const updated = stored.filter(pdf => pdf.id !== id);
      
      if (updated.length === stored.length) {
        return false; // PDF not found
      }

      await this.saveAllPDFs(updated);
      return true;
    } catch (error) {
      console.error("Failed to delete PDF:", error);
      return false;
    }
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{ totalFiles: number; totalSize: number }> {
    try {
      const pdfs = await this.getAllPDFs();
      const totalSize = pdfs.reduce((sum, pdf) => sum + pdf.size, 0);
      return {
        totalFiles: pdfs.length,
        totalSize
      };
    } catch (error) {
      console.error("Failed to get storage stats:", error);
      return { totalFiles: 0, totalSize: 0 };
    }
  }

  /**
   * Get stored PDFs from AsyncStorage
   */
  private static async getStoredPDFs(): Promise<PDFDocument[]> {
    try {
      // For now, we'll use a simple in-memory storage
      // In a real app, you'd use AsyncStorage here
      return this.getInMemoryPDFs();
    } catch (error) {
      console.error("Failed to get stored PDFs:", error);
      return [];
    }
  }

  /**
   * Save metadata for a single PDF
   */
  private static async saveMetadata(pdf: PDFDocument): Promise<void> {
    try {
      const stored = await this.getStoredPDFs();
      stored.push(pdf);
      await this.saveAllPDFs(stored);
    } catch (error) {
      console.error("Failed to save metadata:", error);
      throw error;
    }
  }

  /**
   * Save all PDFs to storage
   */
  private static async saveAllPDFs(pdfs: PDFDocument[]): Promise<void> {
    try {
      // For now, we'll use in-memory storage
      // In a real app, you'd use AsyncStorage here
      this.setInMemoryPDFs(pdfs);
    } catch (error) {
      console.error("Failed to save all PDFs:", error);
      throw error;
    }
  }

  // Temporary in-memory storage (replace with AsyncStorage in production)
  private static inMemoryPDFs: PDFDocument[] = [];

  private static getInMemoryPDFs(): PDFDocument[] {
    return this.inMemoryPDFs;
  }

  private static setInMemoryPDFs(pdfs: PDFDocument[]): void {
    this.inMemoryPDFs = pdfs;
  }
}
