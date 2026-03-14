import { LocalPDFStorage } from "@/services/localPDFStorage";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { Brain, ChevronLeft, ExternalLink, FileText, Share2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const isAndroidLocal = Platform.OS === "android" && uri?.startsWith("file://");

  const pdfSource = uri?.startsWith("file://")
    ? { uri }
    : {
      uri: `https://docs.google.com/gviewer?embedded=true&url=${encodeURIComponent(uri ?? "")}`,
    };

  const handleShare = async () => {
    try {
      if (Platform.OS === "android" && uri?.startsWith("file://")) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Error", "Sharing is not available on this device.");
        }
      } else {
        await Share.share({ title: name, url: uri });
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  const handleOpenExternal = async () => {
    try {
      if (uri?.startsWith("file://")) {
        await Sharing.shareAsync(uri);
      } else {
        // Fallback for web links
        await Share.share({ url: uri });
      }
    } catch (e) {
      console.error("Open external failed:", e);
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

        {isAndroidLocal ? (
          <View className="flex-1 justify-center items-center px-8 bg-gray-50">
            <View className="w-20 h-20 bg-blue-100 rounded-3xl items-center justify-center mb-6">
              <FileText size={40} color="#3B82F6" />
            </View>
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">
              Local PDF for Android
            </Text>
            <Text className="text-gray-500 text-center mb-8 leading-5">
              Android's built-in viewer cannot display local files directly. Click below to open it in your preferred PDF app.
            </Text>

            <TouchableOpacity
              onPress={handleOpenExternal}
              className="bg-blue-600 flex-row items-center px-8 py-4 rounded-2xl shadow-sm"
              activeOpacity={0.8}
            >
              <ExternalLink size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">Open PDF Viewer</Text>
            </TouchableOpacity>

            <View className="mt-12 p-4 bg-white rounded-2xl border border-gray-100 w-full">
              <Text className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-2">File Path</Text>
              <Text className="text-gray-600 text-[10px] font-mono" numberOfLines={2}>
                {uri}
              </Text>
            </View>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-4xl mb-4">📄</Text>
            <Text className="text-gray-700 font-semibold text-lg mb-2">
              Could not render PDF
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              The file may have been moved or the viewer isn't supported on this
              device.
            </Text>
            <View className="bg-gray-100 rounded-xl p-4 w-full">
              <Text
                className="text-gray-600 text-xs font-mono"
                numberOfLines={3}
              >
                {uri}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleOpenExternal}
              className="mt-6 bg-gray-200 px-6 py-3 rounded-xl flex-row items-center"
            >
              <ExternalLink size={16} color="#374151" />
              <Text className="text-gray-700 font-bold ml-2">Open Externally</Text>
            </TouchableOpacity>
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
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/ai-features",
              params: {
                uri,
                name,
                subject: subject || "General",
                size: String(0),
                uploadDate: new Date().toISOString(),
              },
            })
          }
          className="absolute bottom-6 right-6 bg-purple-600 w-14 h-14 rounded-full shadow-lg items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Brain size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
