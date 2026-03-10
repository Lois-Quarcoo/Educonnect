import { useAuth } from "@/hooks/useAuth";
import { Link, router } from "expo-router";
import {
    ChevronLeft,
    Eye,
    EyeOff,
    Lock,
    Mail,
    User,
    UserPlus,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
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

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const { signup, loading, error, clearError } = useAuth();

  const handleSignup = async () => {
    try {
      await signup(name, email, password);
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
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-[#faf8f5]"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView>
          {/* Back Button */}
          <View className="mt-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View className="bg-yellow-500 mt-10 p-3 rounded-xl self-start">
            <UserPlus size={22} color="#ffffff" />
          </View>

          {/* Heading */}
          <View className="mt-8">
            <Text className="font-black text-3xl tracking-wide text-black">
              Create Account
            </Text>
            <Text className="mt-2 text-slate-400">
              Join EduConnect and start learning today.
            </Text>
          </View>

          {/* General Error Banner */}
          {error?.field === "general" && (
            <View className="mt-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <Text className="text-red-600 text-sm">{error.message}</Text>
            </View>
          )}

          {/* Full Name */}
          <View className="mt-8">
            <Text className="text-slate-500 mb-2 font-medium">Full Name</Text>
            <View
              className={`flex-row items-center bg-white p-4 rounded-xl shadow-sm border
                ${nameHasError ? "border-red-400" : "border-transparent"}`}
            >
              <User size={18} color={nameHasError ? "#f87171" : "#9ca3af"} />
              <TextInput
                className="ml-3 flex-1 text-black"
                placeholder="Lois Quarcoo"
                placeholderTextColor="#9ca3af"
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
          <View className="mt-5">
            <Text className="text-slate-500 mb-2 font-medium">
              Email Address
            </Text>
            <View
              className={`flex-row items-center bg-white p-4 rounded-xl shadow-sm border
                ${emailHasError ? "border-red-400" : "border-transparent"}`}
            >
              <Mail size={18} color={emailHasError ? "#f87171" : "#9ca3af"} />
              <TextInput
                ref={emailRef}
                className="ml-3 flex-1 text-black"
                placeholder="example@example.com"
                placeholderTextColor="#9ca3af"
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
          <View className="mt-5">
            <Text className="text-slate-500 mb-2 font-medium">Password</Text>
            <View
              className={`flex-row items-center bg-white p-4 rounded-xl shadow-sm border
                ${passwordHasError ? "border-red-400" : "border-transparent"}`}
            >
              <Lock
                size={18}
                color={passwordHasError ? "#f87171" : "#9ca3af"}
              />
              <TextInput
                ref={passwordRef}
                className="ml-3 flex-1 text-black"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
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
                  <Eye size={18} color="#9ca3af" />
                ) : (
                  <EyeOff size={18} color="#9ca3af" />
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
          <Text className="mt-4 text-xs text-slate-400 text-center leading-5">
            By signing up, you agree to our{" "}
            <Text className="text-blue-500">Terms of Service</Text> and{" "}
            <Text className="text-blue-500">Privacy Policy</Text>
          </Text>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`mt-6 py-4 rounded-full items-center shadow-sm
              ${loading ? "bg-orange-300" : "bg-orange-400"}`}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-slate-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-green-700 font-semibold">Log in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
