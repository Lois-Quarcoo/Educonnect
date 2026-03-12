import { LocalPDFStorage } from "@/services/localPDFStorage";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PDFViewer() {
  const { uri, name, subject, size, uploadDate } = useLocalSearchParams<{
    uri: string;
    name: string;
    subject: string;
    size: string;
    uploadDate: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Build URL for WebView
  // On iOS/Android we use Google Docs viewer as a fallback for local PDFs
  // For local file:// URIs we pass them directly to the WebView
  const pdfSource = uri?.startsWith("file://")
    ? { uri } // local file — WebView on React Native can open this directly
    : { uri: `https://docs.google.com/gviewer?embedded=true&url=${encodeURIComponent(uri ?? "")}` };

  const handleShare = async () => {
    try {
      await Share.share({ title: name, url: uri });
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  if (!uri) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
        <Text className="text-gray-500 text-lg">PDF not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-600 font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1 mr-2">
          <Text className="font-bold text-gray-900 text-sm" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            {subject} • {LocalPDFStorage.formatFileSize(Number(size ?? 0))}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
        >
          <Share2 size={17} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* PDF via WebView */}
      <View className="flex-1 relative">
        {loading && (
          <View className="absolute inset-0 justify-center items-center bg-white z-10">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-400 mt-3 text-sm">Opening PDF…</Text>
          </View>
        )}

        {error ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-4xl mb-4">📄</Text>
            <Text className="text-gray-700 font-semibold text-lg mb-2">
              Could not render PDF
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              The file may have been moved or the viewer isn't supported on this device.
            </Text>
            <View className="bg-gray-100 rounded-xl p-4 w-full">
              <Text className="text-gray-600 text-xs font-mono" numberOfLines={3}>
                {uri}
              </Text>
            </View>
          </View>
        ) : (
          <WebView
            source={pdfSource}
            style={{ flex: 1 }}
            originWhitelist={["*"]}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccessFromFileURLs={true}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            // Android: enable mixed content
            mixedContentMode="always"
            javaScriptEnabled={true}
            scalesPageToFit={Platform.OS === "android"}
          />
        )}
      </View>
    </SafeAreaView>
  );
}