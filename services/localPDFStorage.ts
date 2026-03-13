import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
<<<<<<< HEAD
import * as FileSystem from "expo-file-system/legacy";
=======
import { Directory, File, Paths } from "expo-file-system";
>>>>>>> 434ac7213f70fad800589cb2756169ae1103b6eb
import { Alert } from "react-native";

export interface PDFDocument {
  id: string;
  name: string;
  uri: string; // permanent file:// path inside documentDirectory
  size: number;
  uploadDate: string;
  subject?: string;
}

// Subject list shown to the user
const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Physics",
  "General",
];

/** Show an Alert-based subject picker and return the chosen subject (or null). */
const pickSubject = (): Promise<string | null> =>
  new Promise((resolve) => {
    Alert.alert(
      "Choose Subject",
      "Which subject does this PDF belong to?",
      [
        ...SUBJECTS.map((s) => ({ text: s, onPress: () => resolve(s) })),
        {
          text: "Cancel",
          style: "cancel" as const,
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });

export class LocalPDFStorage {
  // ── key / path helpers ───────────────────────────────────────────────────────

  /** AsyncStorage key scoped to this user. */
  private static storageKey(userId: string) {
    return `local_pdfs:${userId}`;
  }

  /** Permanent directory for this user's PDFs (created on first use). */
<<<<<<< HEAD
  private static async pdfDir(userId: string): Promise<string> {
    const baseDir = FileSystem.documentDirectory || "";
    const dir = `${baseDir}pdfs/${userId}/`;

    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    return dir;
=======
  private static pdfDir(userId: string): Directory {
    const baseDir = new Directory(Paths.document, "pdfs");
    if (!baseDir.exists) baseDir.create();

    const userDir = new Directory(baseDir, userId);
    if (!userDir.exists) userDir.create();

    return userDir;
>>>>>>> 434ac7213f70fad800589cb2756169ae1103b6eb
  }

  // ── public methods ───────────────────────────────────────────────────────────

  /**
   * Open document picker → copy PDF to permanent storage → persist metadata.
   *
   * @param userId       Logged-in user's _id (data is isolated per user)
   * @param preSubject   Skip subject picker if already known
   */
  static async uploadPDF(
    userId: string,
    preSubject?: string,
  ): Promise<PDFDocument | null> {
    try {
      // 1. Subject
      const subject = preSubject ?? (await pickSubject());
      if (!subject) return null;

      // 2. File picker
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: false,
        multiple: false,
      });

      if (picked.canceled || !picked.assets?.length) return null;
      const asset = picked.assets[0];

      // 3. Copy to a permanent, user-scoped folder
      const dir = this.pdfDir(userId);
      const id = `pdf_${Date.now()}`;

      const sourceFile = new File(asset.uri);
      const destFile = new File(dir, `${id}.pdf`);
      sourceFile.copy(destFile);

      // 4. Build metadata & save
      const doc: PDFDocument = {
        id,
        name: asset.name,
        uri: destFile.uri,
        size: asset.size ?? 0,
        uploadDate: new Date().toISOString(),
        subject,
      };

      const existing = await this.loadAll(userId);
      existing.push(doc);
      await AsyncStorage.setItem(
        this.storageKey(userId),
        JSON.stringify(existing),
      );

      return doc;
    } catch (err) {
      console.error("LocalPDFStorage.uploadPDF:", err);
      Alert.alert("Upload Failed", "Could not save PDF. Please try again.");
      return null;
    }
  }

  /** All PDFs belonging to this user, newest first. */
  static async getAllPDFs(userId: string): Promise<PDFDocument[]> {
    const docs = await this.loadAll(userId);
    return docs.sort(
      (a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
    );
  }

  /** PDFs belonging to this user filtered by subject. */
  static async getPDFsBySubject(
    userId: string,
    subject: string,
  ): Promise<PDFDocument[]> {
    const all = await this.getAllPDFs(userId);
    return subject === "All" ? all : all.filter((p) => p.subject === subject);
  }

  /** Unique subjects the user has uploaded PDFs to. */
  static async getAvailableSubjects(userId: string): Promise<string[]> {
    const all = await this.getAllPDFs(userId);
    const set = new Set<string>();
    all.forEach((p) => {
      if (p.subject) set.add(p.subject);
    });
    return Array.from(set).sort();
  }

  /**
   * Delete a PDF by id.
   * Removes the file from the filesystem AND from AsyncStorage.
   */
  static async deletePDF(userId: string, id: string): Promise<boolean> {
    try {
      const stored = await this.loadAll(userId);
      const target = stored.find((p) => p.id === id);
      if (!target) return false;

      // Remove file (ignore error if already gone)
      try {
<<<<<<< HEAD
        await FileSystem.deleteAsync(target.uri, { idempotent: true });
      } catch {
        // Ignore errors when file doesn't exist
      }
=======
        const file = new File(target.uri);
        if (file.exists) file.delete();
      } catch (_) { }
>>>>>>> 434ac7213f70fad800589cb2756169ae1103b6eb

      const updated = stored.filter((p) => p.id !== id);
      await AsyncStorage.setItem(
        this.storageKey(userId),
        JSON.stringify(updated),
      );
      return true;
    } catch (err) {
      console.error("LocalPDFStorage.deletePDF:", err);
      return false;
    }
  }

  /** Human-readable byte size. */
  static formatFileSize(bytes: number): string {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
  }

  // ── private helpers ──────────────────────────────────────────────────────────

  private static async loadAll(userId: string): Promise<PDFDocument[]> {
    try {
      const raw = await AsyncStorage.getItem(this.storageKey(userId));
      return raw ? (JSON.parse(raw) as PDFDocument[]) : [];
    } catch {
      return [];
    }
  }
}
