import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import {
    BookOpen,
    ChevronLeft,
    Eye,
    EyeOff,
    Lock,
    Mail,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(tabs)/home");
    }, 2000);
  };

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
            <View className="items-center mt-8 mb-8">
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-xl">
                <BookOpen size={36} color="#8B5CF6" />
              </View>
            </View>

            {/* Heading */}
            <View className="items-center mb-8">
              <Text className="font-bold text-3xl text-white text-center mb-2">
                Welcome Back!
              </Text>
              <Text className="text-white/80 text-center">
                Enter your details to continue learning
              </Text>
            </View>

            {/* White Card Container */}
            <View className="bg-white rounded-3xl p-6 shadow-xl">
              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">
                  Email Address
                </Text>
                <View className="flex-row items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Mail size={18} color="#6B7280" />
                  <TextInput
                    className="ml-3 flex-1 text-gray-800"
                    placeholder="example@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Password</Text>
                <View className="flex-row items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Lock size={18} color="#6B7280" />
                  <TextInput
                    className="ml-3 flex-1 text-gray-800"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="mt-2 self-end">
                <Text className="text-purple-600 text-sm font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                className="mt-6 py-4 rounded-full items-center shadow-lg"
                style={{ backgroundColor: "#8B5CF6" }}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">Log In</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View className="mt-6 flex-row justify-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity>
                    <Text className="text-purple-600 font-bold">Sign up</Text>
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

export default Login;
