import { useAuth } from "@/hooks/useAuth";
import { uploadFile } from "@/services/universalUpload";
import { Link, router } from "expo-router";
import {
    ChevronLeft,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Upload,
    User,
    UserPlus,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const { signup, loading, error, clearError } = useAuth();

  const handleImageUpload = async () => {
    try {
      setUploading(true);
      const uploadedFile = await uploadFile("temp", "image", "avatars");
      if (uploadedFile) {
        setProfileImage(uploadedFile.url);
      }
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSignup = async () => {
    try {
      await signup(name, email, password, profileImage);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (error) clearError();
  };
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) clearError();
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) clearError();
  };

  const nameHasError = error?.field === "name";
  const emailHasError = error?.field === "email";
  const passwordHasError = error?.field === "password";

  return (
    <LinearGradient
      colors={["#8B5CF6", "#06B6D4"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView>
            {/* Back Button */}
            <View className="mt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-white/20 backdrop-blur rounded-full items-center justify-center"
                accessibilityLabel="Go back"
              >
                <ChevronLeft size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Logo */}
            <View className="items-center mt-8 mb-6">
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-xl">
                <UserPlus size={36} color="#8B5CF6" />
              </View>
            </View>

            {/* Profile Image Upload */}
            <View className="items-center mb-6">
              <Text className="text-white/80 mb-3 font-medium text-center">
                Profile Picture (Optional)
              </Text>
              <TouchableOpacity
                onPress={handleImageUpload}
                className="mb-4"
                disabled={uploading}
              >
                <View className="w-24 h-24 rounded-full bg-white/20 backdrop-blur items-center justify-center border-2 border-white/30">
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      className="w-full h-full rounded-full"
                    />
                  ) : uploading ? (
                    <View className="items-center justify-center">
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text className="text-white text-xs mt-1">
                        Uploading...
                      </Text>
                    </View>
                  ) : (
                    <View className="items-center justify-center">
                      <Upload size={32} color="#ffffff" />
                      <Text className="text-white text-xs mt-1">
                        Tap to upload
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Heading */}
            <View className="items-center mb-8">
              <Text className="font-bold text-3xl text-white text-center mb-2">
                Create Account
              </Text>
              <Text className="text-white/80 text-center">
                Join EduConnect and start learning today
              </Text>
            </View>

            {/* White Card Container */}
            <View className="bg-white rounded-3xl p-6 shadow-xl">
              {/* General Error Banner */}
              {error?.field === "general" && (
                <View className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <Text className="text-red-600 text-sm">{error.message}</Text>
                </View>
              )}

              {/* Full Name */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">
                  Full Name
                </Text>
                <View
                  className={`flex-row items-center bg-gray-50 p-4 rounded-xl border
                    ${nameHasError ? "border-red-400" : "border-gray-200"}`}
                >
                  <User
                    size={18}
                    color={nameHasError ? "#f87171" : "#6B7280"}
                  />
                  <TextInput
                    className="ml-3 flex-1 text-gray-800"
                    placeholder="Lois Quarcoo"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    autoComplete="name"
                    value={name}
                    onChangeText={handleNameChange}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    editable={!loading}
                  />
                </View>
                {nameHasError && (
                  <Text className="mt-1 text-red-500 text-xs ml-1">
                    {error?.message}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">
                  Email Address
                </Text>
                <View
                  className={`flex-row items-center bg-gray-50 p-4 rounded-xl border
                    ${emailHasError ? "border-red-400" : "border-gray-200"}`}
                >
                  <Mail
                    size={18}
                    color={emailHasError ? "#f87171" : "#6B7280"}
                  />
                  <TextInput
                    ref={emailRef}
                    className="ml-3 flex-1 text-gray-800"
                    placeholder="example@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    value={email}
                    onChangeText={handleEmailChange}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    editable={!loading}
                  />
                </View>
                {emailHasError && (
                  <Text className="mt-1 text-red-500 text-xs ml-1">
                    {error?.message}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Password</Text>
                <View
                  className={`flex-row items-center bg-gray-50 p-4 rounded-xl border
                    ${passwordHasError ? "border-red-400" : "border-gray-200"}`}
                >
                  <Lock
                    size={18}
                    color={passwordHasError ? "#f87171" : "#6B7280"}
                  />
                  <TextInput
                    ref={passwordRef}
                    className="ml-3 flex-1 text-gray-800"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    value={password}
                    onChangeText={handlePasswordChange}
                    returnKeyType="done"
                    onSubmitEditing={handleSignup}
                    editable={!loading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <Eye size={18} color="#6B7280" />
                    ) : (
                      <EyeOff size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                {passwordHasError && (
                  <Text className="mt-1 text-red-500 text-xs ml-1">
                    {error?.message}
                  </Text>
                )}
                {/* Live password length hint */}
                {!passwordHasError &&
                  password.length > 0 &&
                  password.length < 6 && (
                    <Text className="mt-1 text-amber-500 text-xs ml-1">
                      {6 - password.length} more character
                      {6 - password.length !== 1 ? "s" : ""} needed
                    </Text>
                  )}
              </View>

              {/* Terms */}
              <Text className="mt-4 text-xs text-gray-500 text-center leading-5">
                By signing up, you agree to our{" "}
                <Text className="text-purple-600 font-medium">
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text className="text-purple-600 font-medium">
                  Privacy Policy
                </Text>
              </Text>

              {/* Sign Up Button */}
              <TouchableOpacity
                className={`mt-6 py-4 rounded-full items-center shadow-lg ${
                  loading ? "opacity-50" : ""
                }`}
                style={{ backgroundColor: "#8B5CF6" }}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View className="mt-6 flex-row justify-center">
                <Text className="text-gray-600">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-purple-600 font-bold">Log in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Signup;
