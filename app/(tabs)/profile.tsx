import { View, Text, TouchableOpacity, Image } from 'react-native'
import { router, Link } from "expo-router"; 
import React from 'react'
import Image1 from '../../assets/images/image1.jpg'; 
import { SafeAreaView } from 'react-native-safe-area-context'
import { Settings,Camera, Flame } from "lucide-react-native";

const Profile = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#faf8f5] px-4">
      <View>
        <View className="flex-row justify-between items-center">
          <Text className="font-black text-3xl tracking-wide text-black">
            Profile
          </Text>

          <TouchableOpacity onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <Settings size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View className='mt-5 border-2 border-white rounded-lg p-4 shadow-lg bg-white items-center'>
          {/* Profile Picture */}
          <View className='relative mb-4'>
            <Image 
              source={Image1}
              className='w-24 h-24 rounded-full border-4 border-yellow-400'
            />
            
            <View className='absolute bottom-0 right-0 bg-white rounded-full w-6 h-6 items-center justify-center border-2 border-white'>
             <Camera className='#ffffff text-xs font-bold'/>
            </View>
          </View>

          <Text className="font-black text-2xl tracking-wide text-black">
            Lois Quarcoo
          </Text>

          <Text className="font-extralight text-gray-400">
            Grade 10 - Silicon Valley International School
          </Text>

          <TouchableOpacity className='mt-3 bg-slate-200 rounded-full px-6 py-2 self-center'>
            <Text className="text-center">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
       
       <View className='mt-5 border-2 border-white rounded-lg px-4 shadow-lg bg-white items-center'>
         <Flame/>
       </View>
      </View>
    </SafeAreaView>
  )
}

export default Profile