import { useAuth } from "@/hooks/useAuth";
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
import React, { useCallback, useEffect, useState } from "react";
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
import { LocalPDFStorage, PDFDocument } from "../../services/localPDFStorage";

const { width } = Dimensions.get("window");

const MaterialsScreen = () => {
  const { user } = useAuth();
  const [localPDFs, setLocalPDFs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<"cloud" | "local">(
    "local",
  );
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Load available subjects
  const loadAvailableSubjects = useCallback(async () => {
    try {
      const subjects = await LocalPDFStorage.getAvailableSubjects();
      setAvailableSubjects(["All", ...subjects]);
    } catch (error) {
      console.error("Failed to load subjects:", error);
    }
  }, []);

  // Load filtered local PDFs
  const loadFilteredPDFs = useCallback(async () => {
    try {
      setLoading(true);
      let filteredPDFs;
      if (selectedSubject === "All") {
        filteredPDFs = await LocalPDFStorage.getAllPDFs();
      } else {
        filteredPDFs = await LocalPDFStorage.getPDFsBySubject(selectedSubject);
      }

      // Apply search filter
      if (searchQuery) {
        filteredPDFs = filteredPDFs.filter((pdf) =>
          pdf.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      setLocalPDFs(filteredPDFs);
    } catch (error) {
      console.error("Failed to load PDFs:", error);
      Alert.alert("Error", "Failed to load PDFs");
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, searchQuery]);

  // Handle file upload
  const handleUpload = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to upload materials");
      return;
    }

    if (selectedSection === "local") {
      try {
        setUploading(true);
        const result = await LocalPDFStorage.uploadPDF(
          selectedSubject === "All" ? undefined : selectedSubject,
        );
        if (result) {
          Alert.alert(
            "Success!",
            `${result.name} uploaded successfully to ${result.subject}!`,
            [{ text: "View", onPress: () => handleViewPDF(result) }],
          );
          await loadFilteredPDFs(); // Refresh local PDFs
          await loadAvailableSubjects(); // Refresh subjects
        }
      } catch (error) {
        console.error("Upload failed:", error);
        Alert.alert(
          "Upload Failed",
          "Failed to upload material. Please try again.",
        );
      } finally {
        setUploading(false);
      }
    } else {
      Alert.alert(
        "Coming Soon",
        "Cloud materials will be available in the next update!",
      );
    }
  };

  // Handle material deletion
  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      "Delete Material",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDelete(id),
        },
      ],
    );
  };

  const confirmDelete = async (id: string) => {
    try {
      const success = await LocalPDFStorage.deletePDF(id);
      if (success) {
        Alert.alert("Deleted", "Material deleted successfully");
        await loadFilteredPDFs(); // Refresh local PDFs
        await loadAvailableSubjects(); // Refresh subjects
      } else {
        Alert.alert("Error", "Failed to delete material");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      Alert.alert("Error", "Failed to delete material");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedSection === "local") {
      await loadFilteredPDFs();
    }
    setRefreshing(false);
  };

  // Handle section change
  const handleSectionChange = (section: "cloud" | "local") => {
    setSelectedSection(section);
    if (section === "local") {
      loadAvailableSubjects();
      loadFilteredPDFs();
    }
  };

  // Handle subject change
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
  };

  // Handle PDF viewing
  const handleViewPDF = async (pdf: PDFDocument) => {
    try {
      Alert.alert(
        "📄 PDF Details",
        `📁 Name: ${pdf.name}\n📚 Subject: ${pdf.subject || "General"}\n📊 Size: ${LocalPDFStorage.formatFileSize(pdf.size)}\n📅 Uploaded: ${new Date(pdf.uploadDate).toLocaleDateString()}`,
        [{ text: "✅ Got it" }],
      );
    } catch (error) {
      console.error("Failed to view PDF:", error);
      Alert.alert("Error", "Failed to open PDF");
    }
  };

  useEffect(() => {
    if (selectedSection === "local") {
      loadAvailableSubjects();
      loadFilteredPDFs();
    }
  }, [selectedSection]);

  // Render material item
  const renderMaterialItem = ({ item }: { item: PDFDocument }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      }}
      className="bg-white rounded-2xl p-4 mb-4 shadow-lg border border-gray-100"
    >
      <TouchableOpacity
        onPress={() => handleViewPDF(item)}
        className="flex-1"
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text
              className="font-bold text-gray-900 text-lg mb-2"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View className="flex-row items-center">
              <FileText size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {LocalPDFStorage.formatFileSize(item.size)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.name)}
            className="p-3 bg-red-50 rounded-xl"
          >
            <Trash2 size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Clock size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {new Date(item.uploadDate).toLocaleDateString()}
            </Text>
          </View>

          {item.subject && (
            <View className="bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 rounded-full">
              <Text className="text-xs text-white font-bold">
                {item.subject}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render grid item
  const renderGridItem = ({ item }: { item: PDFDocument }) => (
    <TouchableOpacity
      onPress={() => handleViewPDF(item)}
      className="bg-white rounded-2xl p-4 m-2 shadow-lg border border-gray-100"
      style={{ width: (width - 40) / 2 - 16 }}
    >
      <View className="items-center">
        <FileText size={32} color="#6B7280" className="mb-2" />
        <Text
          className="font-semibold text-gray-900 text-sm text-center mb-1"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text className="text-xs text-gray-600 text-center">
          {LocalPDFStorage.formatFileSize(item.size)}
        </Text>
        {item.subject && (
          <View className="bg-blue-100 px-2 py-1 rounded-full mt-2">
            <Text className="text-xs text-blue-800 font-medium">
              {item.subject}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.name)}
        className="absolute top-2 right-2 p-2 bg-red-500 rounded-full"
      >
        <X size={14} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ],
        }}
        className="items-center"
      >
        <HardDrive size={64} color="#9CA3AF" className="mb-4" />
        <Text className="text-gray-600 text-center text-lg mb-2">
          No {selectedSection === "local" ? "PDFs" : "materials"} yet
        </Text>
        <Text className="text-gray-500 text-center text-sm mb-6">
          Upload your first {selectedSection === "local" ? "PDF" : "material"}{" "}
          to get started
        </Text>

        <TouchableOpacity
          onPress={handleUpload}
          className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
        >
          <Plus size={20} color="white" className="mr-2" />
          <Text className="text-white font-semibold">
            Upload {selectedSection === "local" ? "PDF" : "Material"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Animated.View style={{ opacity: fadeAnim }}>
            <Folder size={48} color="#9CA3AF" />
            <Text className="text-gray-600 text-center text-lg mt-4">
              Please login to access materials
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Header */}
      <View className="bg-white/90 backdrop-blur-lg border-b border-gray-200 px-4 pt-12 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">📚 Materials</Text>
          <TouchableOpacity
            onPress={handleUpload}
            disabled={uploading || selectedSection === "cloud"}
            className={`px-6 py-3 rounded-xl flex-row items-center shadow-lg ${
              uploading || selectedSection === "cloud" ? "opacity-50" : ""
            }`}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Upload size={18} color="white" />
            )}
            <Text className="text-white font-bold ml-2">
              {uploading ? "Uploading..." : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Toggle */}
        <View className="flex-row space-x-3 mb-4">
          <TouchableOpacity
            onPress={() => handleSectionChange("cloud")}
            className={`px-4 py-2 rounded-xl flex-row items-center ${
              selectedSection === "cloud" ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <Folder
              size={16}
              className={`mr-2 ${selectedSection === "cloud" ? "text-white" : "text-gray-700"}`}
            />
            <Text
              className={`font-semibold ${selectedSection === "cloud" ? "text-white" : "text-gray-700"}`}
            >
              Cloud
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSectionChange("local")}
            className={`px-4 py-2 rounded-xl flex-row items-center ${
              selectedSection === "local" ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <HardDrive
              size={16}
              className={`mr-2 ${selectedSection === "local" ? "text-white" : "text-gray-700"}`}
            />
            <Text
              className={`font-semibold ${selectedSection === "local" ? "text-white" : "text-gray-700"}`}
            >
              Local PDFs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and View Mode - Only for Local PDFs */}
        {selectedSection === "local" && (
          <View className="flex-row space-x-3 mb-4">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
              <Search size={16} color="#6B7280" className="mr-2" />
              <TextInput
                className="flex-1 text-gray-700"
                placeholder="Search PDFs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <Grid3X3
                  size={16}
                  className={
                    viewMode === "grid" ? "text-white" : "text-gray-700"
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <List
                  size={16}
                  className={
                    viewMode === "list" ? "text-white" : "text-gray-700"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Subject Filter - Only show for Local PDFs */}
        {selectedSection === "local" && availableSubjects.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            <View className="flex-row space-x-2">
              {availableSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  onPress={() => handleSubjectChange(subject)}
                  className={`px-4 py-2 rounded-full ${
                    selectedSubject === subject ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      selectedSubject === subject
                        ? "text-white"
                        : "text-gray-700"
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
          <Text className="text-gray-600 mt-4">Loading materials...</Text>
        </View>
      ) : selectedSection === "local" && localPDFs.length === 0 ? (
        <ScrollView className="flex-1">{renderEmptyState()}</ScrollView>
      ) : selectedSection === "local" ? (
        <ScrollView
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {viewMode === "grid" ? (
            <View className="flex-row flex-wrap justify-between">
              {localPDFs.map((item) => (
                <View key={item.id}>{renderGridItem({ item })}</View>
              ))}
            </View>
          ) : (
            <View className="space-y-3">
              {localPDFs.map((item) => (
                <View key={item.id}>{renderMaterialItem({ item })}</View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Animated.View style={{ opacity: fadeAnim }}>
            <Folder size={64} color="#9CA3AF" />
            <Text className="text-gray-600 text-center text-lg mt-4 mb-2">
              Cloud Materials
            </Text>
            <Text className="text-gray-500 text-center text-sm mb-6">
              Coming soon in the next update!
            </Text>
            <Text className="text-gray-400 text-center text-xs">
              Switch to Local PDFs to upload and manage files
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MaterialsScreen;
