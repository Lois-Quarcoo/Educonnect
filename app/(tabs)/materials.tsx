import { useAuth } from "@/hooks/useAuth";
import {
    formatFileSize,
    getFileIcon,
    uploadFile,
    UploadResult,
} from "@/services/universalUpload";
import { BookOpen, FileText, Plus, Trash2, Upload } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MaterialsScreen = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<UploadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load materials
  const loadMaterials = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // TODO: Fetch materials from backend
      // For now, use mock data
      const mockMaterials: UploadResult[] = [
        {
          id: "1",
          name: "Math Notes Chapter 1.pdf",
          type: "pdf",
          url: "https://example.com/math-notes.pdf",
          size: 2048576,
          uploadedAt: new Date("2024-01-15"),
          mimeType: "application/pdf",
        },
        {
          id: "2",
          name: "Science Diagram.png",
          type: "image",
          url: "https://example.com/science-diagram.png",
          size: 1024576,
          uploadedAt: new Date("2024-01-14"),
          mimeType: "image/png",
        },
      ];
      setMaterials(mockMaterials);
    } catch (error) {
      console.error("Error loading materials:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Handle material upload
  const handleUploadMaterial = async () => {
    if (!user) {
      Alert.alert("Error", "Please login to upload materials");
      return;
    }

    try {
      setUploading(true);
      const material = await uploadFile(user._id, "document", "materials");

      if (material) {
        setMaterials((prev) => [material, ...prev]);
        Alert.alert("Success", `${material.name} uploaded successfully!`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload material. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle material deletion
  const handleDeleteMaterial = (material: UploadResult) => {
    Alert.alert(
      "Delete Material",
      `Are you sure you want to delete "${material.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setMaterials((prev) => prev.filter((m) => m.id !== material.id));
            // TODO: Delete from backend and Cloudinary
            Alert.alert("Success", "Material deleted successfully");
          },
        },
      ],
    );
  };

  // Handle material download/view
  const handleViewMaterial = (material: UploadResult) => {
    // TODO: Implement material viewing/downloading
    Alert.alert("Open Material", `Opening ${material.name}...`);
  };

  // Refresh materials
  const onRefresh = () => {
    setRefreshing(true);
    loadMaterials();
  };

  useEffect(() => {
    loadMaterials();
  }, [user, loadMaterials]);

  // Material Item Component
  const MaterialItem = ({ material }: { material: UploadResult }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-start">
        <View className="w-12 h-12 rounded-lg bg-blue-50 items-center justify-center mr-3">
          <Text className="text-2xl">{getFileIcon(material.type)}</Text>
        </View>

        <View className="flex-1">
          <Text
            className="font-semibold text-gray-900 text-base mb-1"
            numberOfLines={1}
          >
            {material.name}
          </Text>

          <View className="flex-row items-center mb-2">
            <Text className="text-gray-500 text-xs mr-3">
              {formatFileSize(material.size)}
            </Text>
            <Text className="text-gray-500 text-xs">
              {material.uploadedAt.toLocaleDateString()}
            </Text>
          </View>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => handleViewMaterial(material)}
              className="bg-blue-50 px-3 py-1.5 rounded-lg flex-row items-center"
            >
              <BookOpen size={14} color="#3B82F6" />
              <Text className="text-blue-600 text-xs font-medium ml-1">
                View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeleteMaterial(material)}
              className="bg-red-50 px-3 py-1.5 rounded-lg flex-row items-center"
            >
              <Trash2 size={14} color="#EF4444" />
              <Text className="text-red-600 text-xs font-medium ml-1">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Materials</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Upload and manage your learning materials
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleUploadMaterial}
            disabled={uploading}
            className="bg-blue-500 p-3 rounded-full shadow-lg"
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Plus size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View className="flex-row space-x-3 mb-6">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-xs">Total Materials</Text>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {materials.length}
                </Text>
              </View>
              <FileText size={24} color="#3B82F6" />
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-xs">Storage Used</Text>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {formatFileSize(
                    materials.reduce((total, m) => total + m.size, 0),
                  )}
                </Text>
              </View>
              <Upload size={24} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Materials List */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Your Materials
          </Text>

          {loading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 text-sm mt-3">
                Loading materials...
              </Text>
            </View>
          ) : materials.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Upload size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4 mb-6">
                No materials uploaded yet. Tap the + button to upload your first
                learning material!
              </Text>
              <TouchableOpacity
                onPress={handleUploadMaterial}
                className="bg-blue-500 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">
                  Upload Material
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            materials.map((material) => (
              <MaterialItem key={material.id} material={material} />
            ))
          )}
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MaterialsScreen;
