import { router,Link } from "expo-router";
import {BookOpenText,ChevronLeft,Mail,Lock,EyeOff,} from "lucide-react-native";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#faf8f5] px-4">
      
      
      <View className="mt-2">
        <TouchableOpacity onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Logo icon */}
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

      {/* Email input */}
      <View className="mt-8">
        <Text className="text-slate-500 mb-2 font-medium">
          Email or Mobile Number
        </Text>
        <View className="flex-row items-center bg-white p-4 rounded-xl shadow-lg">
          <Mail size={18} color="#9ca3af" />
          <TextInput
            className="ml-3 flex-1 text-black"
            placeholder="example@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

       
      <View className="mt-5">
        <Text className="text-slate-500 mb-2 font-medium">Password</Text>
        <View className="flex-row items-center bg-white p-4 rounded-xl shadow-lg ">
          <Lock size={18} color="#9ca3af" />
          <TextInput
            className="ml-3 flex-1 text-black"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <EyeOff size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot password */}
      <TouchableOpacity className="mt-3 self-end">
        <Text className="text-blue-600 text-sm">Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login button */}
      <Link href='/(auth)/signup  ' asChild>
      <TouchableOpacity className="mt-6 bg-orange-400 py-4 rounded-full items-center shadow-lg ">
        <Text className="text-white font-semibold text-lg">Log In</Text>
      </TouchableOpacity>
      </Link>

      
      <Text className ="mt-6 text-center text-slate-400">
        Or login with
      </Text>

     
      <View className="mt-4 flex-row justify-between">
        <TouchableOpacity className="flex-1 bg-white py-4 rounded-xl items-center mr-3 shadow-lg">
          <Text className="font-medium">Google</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-white py-4 rounded-xl items-center ml-3 shadow-lg">
          <Text className="font-medium">Apple</Text>
        </TouchableOpacity>
      </View>

      
      <View className="mt-6 flex-row justify-center">
        <Text className="text-slate-500">Don’t have an account? </Text>
        <TouchableOpacity>
          <Text className="text-green-700 font-semibold">Sign up</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default Login;