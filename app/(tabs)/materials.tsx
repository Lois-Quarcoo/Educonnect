import { useAuth } from "@/hooks/useAuth";
import { LocalPDFStorage, PDFDocument } from "@/services/localPDFStorage";
import { router } from "expo-router";
import {
  Clock,
  FileText,
  Folder,
  Grid3X3,
  HardDrive,
  List,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const MaterialsScreen = () => {
  const { user } = useAuth();
  const [localPDFs, setLocalPDFs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<"cloud" | "local">("local");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ── helpers (always pass user._id) ───────────────────────────────────────

  const loadAvailableSubjects = useCallback(async () => {
    if (!user) return;
    try {
      const subjects = await LocalPDFStorage.getAvailableSubjects(user._id);
      setAvailableSubjects(["All", ...subjects]);
    } catch (error) {
      console.error("Failed to load subjects:", error);
    }
  }, [user]);

  const loadFilteredPDFs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      let filteredPDFs =
        selectedSubject === "All"
          ? await LocalPDFStorage.getAllPDFs(user._id)
          : await LocalPDFStorage.getPDFsBySubject(user._id, selectedSubject);

      if (searchQuery) {
        filteredPDFs = filteredPDFs.filter((pdf) =>
          pdf.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }
      setLocalPDFs(filteredPDFs);
    } catch (error) {
      console.error("Failed to load PDFs:", error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedSubject, searchQuery]);

  // ── upload ────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to upload materials");
      return;
    }
    if (selectedSection === "cloud") {
      Alert.alert("Coming Soon", "Cloud materials will be available in the next update!");
      return;
    }

    try {
      setUploading(true);
      // ✅ Pass user._id so the file is stored under THIS user only
      const result = await LocalPDFStorage.uploadPDF(
        user._id,
        selectedSubject === "All" ? undefined : selectedSubject,
      );
      if (result) {
        Alert.alert(
          "✅ Saved!",
          `"${result.name}" saved to ${result.subject}`,
          [{ text: "OK" }],
        );
        await loadFilteredPDFs();
        await loadAvailableSubjects();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Upload Failed", "Failed to save material. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Material", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => confirmDelete(id) },
    ]);
  };

  const confirmDelete = async (id: string) => {
    if (!user) return;
    try {
      // ✅ Pass user._id
      const success = await LocalPDFStorage.deletePDF(user._id, id);
      if (success) {
        await loadFilteredPDFs();
        await loadAvailableSubjects();
      } else {
        Alert.alert("Error", "Failed to delete material");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // ── view PDF ──────────────────────────────────────────────────────────────

  // ✅ FIXED: navigate to PDF viewer screen instead of showing an Alert
  const handleViewPDF = (pdf: PDFDocument) => {
    router.push({
      pathname: "/pdf-viewer",
      params: {
        uri: pdf.uri,
        name: pdf.name,
        subject: pdf.subject ?? "General",
        size: String(pdf.size),
        uploadDate: pdf.uploadDate,
      },
    });
  };

  // ── effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedSection === "local") {
      loadAvailableSubjects();
      loadFilteredPDFs();
    }
  }, [selectedSection, selectedSubject, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFilteredPDFs();
    setRefreshing(false);
  };

  // ── render helpers ────────────────────────────────────────────────────────

  const renderListItem = (item: PDFDocument) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleViewPDF(item)}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-start"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3 mt-1">
        <FileText size={20} color="#3B82F6" />
      </View>

      <View className="flex-1 mr-3">
        <Text className="font-bold text-gray-900 text-base mb-1" numberOfLines={2}>
          {item.name}
        </Text>
        <View className="flex-row items-center flex-wrap gap-2">
          <Text className="text-sm text-gray-500">
            {LocalPDFStorage.formatFileSize(item.size)}
          </Text>
          {item.subject && (
            <View className="bg-blue-100 px-2 py-0.5 rounded-full">
              <Text className="text-xs text-blue-700 font-semibold">{item.subject}</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center mt-1">
          <Clock size={12} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 ml-1">
            {new Date(item.uploadDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.name)}
        className="p-2 bg-red-50 rounded-xl"
        hitSlop={8}
      >
        <Trash2 size={16} color="#DC2626" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGridItem = (item: PDFDocument) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleViewPDF(item)}
      className="bg-white rounded-2xl p-4 m-1 shadow-sm border border-gray-100 items-center"
      style={{ width: (width - 48) / 2 }}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mb-2">
        <FileText size={26} color="#3B82F6" />
      </View>
      <Text className="font-semibold text-gray-900 text-sm text-center mb-1" numberOfLines={2}>
        {item.name}
      </Text>
      <Text className="text-xs text-gray-500 mb-1">
        {LocalPDFStorage.formatFileSize(item.size)}
      </Text>
      {item.subject && (
        <View className="bg-blue-100 px-2 py-0.5 rounded-full mb-2">
          <Text className="text-xs text-blue-700 font-semibold">{item.subject}</Text>
        </View>
      )}
      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.name)}
        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full"
        hitSlop={8}
      >
        <X size={12} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center px-6 py-16">
      <HardDrive size={56} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">No PDFs yet</Text>
      <Text className="text-gray-400 text-sm text-center mb-6">
        Upload your first PDF to get started
      </Text>
      <TouchableOpacity
        onPress={handleUpload}
        className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
      >
        <Plus size={18} color="white" />
        <Text className="text-white font-semibold ml-2">Upload PDF</Text>
      </TouchableOpacity>
    </View>
  );

  // ── guard ─────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Folder size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg mt-4 text-center">
          Please login to access materials
        </Text>
      </SafeAreaView>
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-4 pb-3">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">📚 Materials</Text>
          <TouchableOpacity
            onPress={handleUpload}
            disabled={uploading || selectedSection === "cloud"}
            className={`px-4 py-2.5 rounded-xl flex-row items-center bg-blue-600 ${
              uploading || selectedSection === "cloud" ? "opacity-50" : ""
            }`}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Upload size={16} color="white" />
            )}
            <Text className="text-white font-bold ml-2 text-sm">
              {uploading ? "Saving..." : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Toggle */}
        <View className="flex-row space-x-3 mb-3">
          {(["local", "cloud"] as const).map((section) => (
            <TouchableOpacity
              key={section}
              onPress={() => setSelectedSection(section)}
              className={`px-4 py-2 rounded-xl flex-row items-center ${
                selectedSection === section ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              {section === "cloud" ? (
                <Folder size={15} color={selectedSection === section ? "white" : "#374151"} />
              ) : (
                <HardDrive size={15} color={selectedSection === section ? "white" : "#374151"} />
              )}
              <Text
                className={`ml-1.5 font-semibold text-sm ${
                  selectedSection === section ? "text-white" : "text-gray-700"
                }`}
              >
                {section === "local" ? "Local PDFs" : "Cloud"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search + view toggle */}
        {selectedSection === "local" && (
          <View className="flex-row space-x-2 mb-3">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
              <Search size={15} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-700 text-sm"
                placeholder="Search PDFs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              className={`p-2.5 rounded-xl ${viewMode === "list" ? "bg-blue-600" : "bg-gray-100"}`}
            >
              <List size={16} color={viewMode === "list" ? "white" : "#374151"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl ${viewMode === "grid" ? "bg-blue-600" : "bg-gray-100"}`}
            >
              <Grid3X3 size={16} color={viewMode === "grid" ? "white" : "#374151"} />
            </TouchableOpacity>
          </View>
        )}

        {/* Subject filter chips */}
        {selectedSection === "local" && availableSubjects.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2 pb-1">
              {availableSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  onPress={() => setSelectedSubject(subject)}
                  className={`px-3 py-1.5 rounded-full ${
                    selectedSubject === subject ? "bg-blue-600" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selectedSubject === subject ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-3">Loading materials...</Text>
        </View>
      ) : selectedSection === "local" ? (
        localPDFs.length === 0 ? (
          renderEmpty()
        ) : (
          <ScrollView
            className="flex-1 px-4 pt-3"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {viewMode === "list" ? (
              localPDFs.map((item) => renderListItem(item))
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {localPDFs.map((item) => renderGridItem(item))}
              </View>
            )}
          </ScrollView>
        )
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Folder size={56} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">Cloud Materials</Text>
          <Text className="text-gray-400 text-sm text-center">Coming soon in the next update!</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MaterialsScreen;