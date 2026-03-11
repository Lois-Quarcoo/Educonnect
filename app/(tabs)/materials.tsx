import { useAuth } from "@/hooks/useAuth";
import { LocalPDFStorage, PDFDocument } from "@/services/localPDFStorage";
import { BookOpen, FileText, Plus, Trash2, Upload, Folder, HardDrive } from "lucide-react-native";
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
  const [localPDFs, setLocalPDFs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'cloud' | 'local'>('cloud');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Load available subjects
  const loadAvailableSubjects = useCallback(async () => {
    try {
      const subjects = await LocalPDFStorage.getAvailableSubjects();
      setAvailableSubjects(['All', ...subjects]);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  }, []);

  // Load filtered local PDFs
  const loadFilteredPDFs = useCallback(async () => {
    try {
      setLoading(true);
      let filteredPDFs;
      if (selectedSubject === 'All') {
        filteredPDFs = await LocalPDFStorage.getAllPDFs();
      } else {
        filteredPDFs = await LocalPDFStorage.getPDFsBySubject(selectedSubject);
      }
      setLocalPDFs(filteredPDFs);
    } catch (error) {
      console.error('Failed to load PDFs:', error);
      Alert.alert('Error', 'Failed to load PDFs');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  // Handle file upload
  const handleUpload = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to upload materials');
      return;
    }

    if (selectedSection === 'local') {
      try {
        setUploading(true);
        const result = await LocalPDFStorage.uploadPDF(selectedSubject === 'All' ? undefined : selectedSubject);
        if (result) {
          Alert.alert('Success', `${result.name} uploaded successfully to ${result.subject}!`);
          await loadFilteredPDFs(); // Refresh local PDFs
          await loadAvailableSubjects(); // Refresh subjects
        }
      } catch (error) {
        console.error('Upload failed:', error);
        Alert.alert('Error', 'Failed to upload material');
      } finally {
        setUploading(false);
      }
    }
  };

  // Handle material deletion
  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      'Delete Material',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(id) }
      ]
    );
  };

  const confirmDelete = async (id: string) => {
    try {
      const success = await LocalPDFStorage.deletePDF(id);
      if (success) {
        Alert.alert('Success', 'Material deleted successfully');
        await loadFilteredPDFs(); // Refresh local PDFs
        await loadAvailableSubjects(); // Refresh subjects
      } else {
        Alert.alert('Error', 'Failed to delete material');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      Alert.alert('Error', 'Failed to delete material');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedSection === 'local') {
      await loadFilteredPDFs();
    }
    setRefreshing(false);
  };

  // Handle section change
  const handleSectionChange = (section: 'cloud' | 'local') => {
    setSelectedSection(section);
    if (section === 'local') {
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
        'PDF Details',
        `Name: ${pdf.name}\nSubject: ${pdf.subject || 'General'}\nSize: ${LocalPDFStorage.formatFileSize(pdf.size)}\nUploaded: ${new Date(pdf.uploadDate).toLocaleDateString()}`,
        [
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Failed to view PDF:', error);
      Alert.alert('Error', 'Failed to open PDF');
    }
  };

  useEffect(() => {
    if (selectedSection === 'local') {
      loadAvailableSubjects();
      loadFilteredPDFs();
    }
  }, [selectedSection]);

  // Render material item
  const renderMaterialItem = ({ item }: { item: PDFDocument }) => (
    <TouchableOpacity
      onPress={() => handleViewPDF(item)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-base mb-1" numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row items-center">
            <FileText size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {LocalPDFStorage.formatFileSize(item.size)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.name)}
          className="p-2 bg-red-50 rounded-lg"
        >
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <BookOpen size={12} color="#6B7280" />
          <Text className="text-xs text-gray-500 ml-1">
            {new Date(item.uploadDate).toLocaleDateString()}
          </Text>
        </View>
        
        {item.subject && (
          <View className="bg-blue-100 px-2 py-1 rounded-full">
            <Text className="text-xs text-blue-800 font-medium">
              {item.subject}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <HardDrive size={48} color="#9CA3AF" />
      <Text className="text-gray-600 text-center mt-4 text-base">
        No {selectedSection === 'local' ? 'PDFs' : 'materials'} uploaded yet
      </Text>
      <Text className="text-gray-500 text-center mt-2 text-sm">
        Upload your first {selectedSection === 'local' ? 'PDF' : 'material'} to get started
      </Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 text-center text-base">
            Please login to access materials
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-gray-900">
            Materials
          </Text>
          <TouchableOpacity
            onPress={handleUpload}
            disabled={uploading || selectedSection === 'cloud'}
            className={`px-4 py-2 rounded-lg flex-row items-center ${
              uploading || selectedSection === 'cloud' ? 'opacity-50' : ''
            }`}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Upload size={16} color="white" />
            )}
            <Text className="text-white font-medium ml-2">
              {uploading ? 'Uploading...' : 'Upload'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Toggle */}
        <View className="flex-row space-x-2 mb-2">
          <TouchableOpacity
            onPress={() => handleSectionChange('cloud')}
            className={`px-3 py-1 rounded-full ${
              selectedSection === 'cloud' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedSection === 'cloud' ? 'text-white' : 'text-gray-700'
              }`}
            >
              <Folder size={14} className="mr-1" />
              Cloud
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleSectionChange('local')}
            className={`px-3 py-1 rounded-full ${
              selectedSection === 'local' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedSection === 'local' ? 'text-white' : 'text-gray-700'
              }`}
            >
              <HardDrive size={14} className="mr-1" />
              Local PDFs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subject Filter - Only show for local section */}
        {selectedSection === 'local' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row space-x-2">
              {availableSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  onPress={() => handleSubjectChange(subject)}
                  className={`px-3 py-1 rounded-full ${
                    selectedSubject === subject ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedSubject === subject ? 'text-white' : 'text-gray-700'
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
        </View>
      ) : selectedSection === 'local' && localPDFs.length === 0 ? (
        <ScrollView className="flex-1">
          {renderEmptyState()}
        </ScrollView>
      ) : selectedSection === 'local' ? (
        <ScrollView className="flex-1">
          <View className="px-4 py-4">
            {localPDFs.map((item) => (
              <View key={item.id}>
                {renderMaterialItem({ item })}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Folder size={48} color="#9CA3AF" />
          <Text className="text-gray-600 text-center mt-4 text-base">
            Cloud materials coming soon
          </Text>
          <Text className="text-gray-500 text-center mt-2 text-sm">
            Switch to Local PDFs to upload and manage files
          </Text>
        </View>
      )}

      {/* Refresh control */}
      {selectedSection === 'local' && (
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      )}
    </SafeAreaView>
  );
};

export default MaterialsScreen;
