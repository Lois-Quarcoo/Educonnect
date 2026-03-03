import { router,Link } from "expo-router";
import {BookOpenText,ChevronLeft,Mail,Lock,Eye,UserPlus,User } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const Signup = () => {
  return (
        <SafeAreaView className="flex-1 bg-[#faf8f5] px-4">
          
          
          <View className="mt-2">
            <TouchableOpacity onPress={() => router.back()}
              className="w-10 h-10 bg-white rounded-full items-center justify-center">
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="bg-yellow-500 mt-10 p-3 rounded-xl self-start">
            <UserPlus size={22} color="#ffffff" />
         </View>

           <View className="mt-8">
                 <Text className="font-black text-3xl tracking-wide text-black">
                 Create Account
                 </Text>
                 <Text className="mt-2 text-slate-400">
                  Join EduConnect and start learning today.
                 </Text>
               </View>

            <View className="mt-8">
                <Text className="text-slate-500 mb-2 font-medium">
                 Full Name
                </Text>
                <View className="flex-row items-center bg-white p-4 rounded-xl shadow-lg">
                  < User size={18} color="#9ca3af" />
                  <TextInput
                    className="ml-3 flex-1 text-black"
                    placeholder="Lois Quarcoo"
                    placeholderTextColor="#9ca3af"
                    keyboardType="default"
                    autoCapitalize="none"
                  />
                  </View>
                </View>

               <View >
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
                        
                        />
                         <Eye size={18} color="#9ca3af" />
                       
                      </View>
                    </View>

                   <Link href='/(tabs)/profile' asChild>
                          <TouchableOpacity className="mt-6 bg-orange-400 py-4 rounded-full items-center shadow-lg ">
                            <Text className="text-white font-semibold text-lg">Sign Up</Text>
                          </TouchableOpacity>
                   </Link>
                    
             </View>

          
          
    </SafeAreaView>
  )
}

export default Signup