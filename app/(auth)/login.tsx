import { router, Link } from 'expo-router';
import { BookOpenText, ChevronLeft, Mail, Lock, EyeOff, Eye } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <BookOpenText size={22} color="#ffffff" />
          </View>

          {/* Heading */}
          <View className="mt-8">
            <Text className="font-black text-3xl tracking-wide text-black">
              Welcome Back!
            </Text>
            <Text className="mt-2 text-slate-400">
              Enter your details to get back to class
            </Text>
          </View>

          {/* Email Input */}
          <View className="mt-8">
            <Text className="text-slate-500 mb-2 font-medium">Email Address</Text>
            <View className="flex-row items-center bg-white p-4 rounded-xl shadow-sm border border-transparent">
              <Mail size={18} color="#9ca3af" />
              <TextInput
                className="ml-3 flex-1 text-black"
                placeholder="example@example.com"
                placeholderTextColor="#9ca3af"
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
          <View className="mt-5">
            <Text className="text-slate-500 mb-2 font-medium">Password</Text>
            <View className="flex-row items-center bg-white p-4 rounded-xl shadow-sm border border-transparent">
              <Lock size={18} color="#9ca3af" />
              <TextInput
                className="ml-3 flex-1 text-black"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
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
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <Eye size={18} color="#9ca3af" />
                  : <EyeOff size={18} color="#9ca3af" />}
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="mt-3 self-end">
            <Text className="text-blue-600 text-sm">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className="mt-6 py-4 rounded-full items-center shadow-sm bg-orange-400"
            onPress={handleLogin}
          >
            <Text className="text-white font-semibold text-lg">Log In</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-slate-500"></Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-green-700 font-semibold">Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;