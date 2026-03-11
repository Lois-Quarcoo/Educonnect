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

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${asset.name}`;
      const documentDir = FileSystem.documentDirectory || "";
      const localUri = `${documentDir}${this.STORAGE_DIR}${fileName}`;

      // Initialize storage directory
      await this.initializeStorage();

      // Copy file to local storage
      await FileSystem.copyAsync({
        from: asset.uri,
        to: localUri,
      });

      // Ask user for subject if not provided
      let selectedSubject = subject;
      if (!selectedSubject) {
        // For now, you can implement a simple prompt
        // In a real app, you'd show a modal with subject options
        selectedSubject = "General";
      }

      // Create PDF document metadata
      const pdfDoc: PDFDocument = {
        id: `pdf_${timestamp}`,
        name: asset.name,
        uri: localUri,
        size: asset.size || 0,
        uploadDate: new Date().toISOString(),
        subject: selectedSubject,
      };

      // Save metadata
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
      const stored = await this.getFromLocalStorage();
      return stored.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
      );
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
      return allPDFs.filter((pdf) => pdf.subject === subject);
    } catch (error) {
      console.error("Failed to get PDFs by subject:", error);
      return [];
    }
  }

  /**
   * Get all available subjects
   */
  static async getAvailableSubjects(): Promise<string[]> {
    try {
      const allPDFs = await this.getAllPDFs();
      const subjects = new Set(
        allPDFs.map((pdf) => pdf.subject).filter(Boolean),
      );
      return Array.from(subjects);
    } catch (error) {
      console.error("Failed to get available subjects:", error);
      return [];
    }
  }

  /**
   * Get PDF by ID
   */
  static async getPDFById(id: string): Promise<PDFDocument | null> {
    try {
      const pdfs = await this.getAllPDFs();
      return pdfs.find((pdf) => pdf.id === id) || null;
    } catch (error) {
      console.error("Failed to get PDF by ID:", error);
      return null;
    }
  }

  /**
   * Delete a PDF from local storage
   */
  static async deletePDF(id: string): Promise<boolean> {
    try {
      const pdfs = await this.getAllPDFs();
      const updatedPDFs = pdfs.filter((pdf) => pdf.id !== id);

      await this.saveToLocalStorageArray(updatedPDFs);
      return true;
    } catch (error) {
      console.error("Failed to delete PDF:", error);
      return false;
    }
  }

  /**
   * Get PDF file content for AI processing
   */
  static async getPDFContent(pdfDoc: PDFDocument): Promise<string> {
    try {
      // For now, return the URI - the AI service can process it directly
      // In a real implementation, you'd use a PDF parsing library
      return pdfDoc.uri;
    } catch (error) {
      console.error("Failed to read PDF content:", error);
      throw new Error("Failed to read PDF content for AI processing");
    }
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Save PDF document to local storage
   */
  private static async saveToLocalStorage(pdfDoc: PDFDocument): Promise<void> {
    try {
      const pdfs = await this.getAllPDFs();
      pdfs.push(pdfDoc);

      // Store in AsyncStorage-like format (using simple object for now)
      const storageData = JSON.stringify(pdfs);

      // For React Native, we'll use a simple approach
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.STORAGE_KEY, storageData);
      }
    } catch (error) {
      console.error("Failed to save to local storage:", error);
    }
  }

  /**
   * Get PDFs from local storage
   */
  private static async getFromLocalStorage(): Promise<PDFDocument[]> {
    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      }
      return [];
    } catch (error) {
      console.error("Failed to get from local storage:", error);
      return [];
    }
  }

  /**
   * Save array of PDFs to local storage
   */
  private static async saveToLocalStorageArray(
    pdfs: PDFDocument[],
  ): Promise<void> {
    try {
      const storageData = JSON.stringify(pdfs);

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.STORAGE_KEY, storageData);
      }
    } catch (error) {
      console.error("Failed to save array to local storage:", error);
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalPDFs: number;
    totalSize: number;
    formattedSize: string;
  }> {
    try {
      const pdfs = await this.getAllPDFs();
      const totalSize = pdfs.reduce((sum, pdf) => sum + pdf.size, 0);

      return {
        totalPDFs: pdfs.length,
        totalSize,
        formattedSize: this.formatFileSize(totalSize),
      };
    } catch (error) {
      console.error("Failed to get storage stats:", error);
      return {
        totalPDFs: 0,
        totalSize: 0,
        formattedSize: "0 Bytes",
      };
    }
  }
}
