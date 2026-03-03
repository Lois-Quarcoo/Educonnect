import { View, Text, ImageBackground, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import pick from "../../assets/images/image1.jpg"
import learn from "../../assets/images/e-learning.png"
import { BookOpenText, WifiOff } from 'lucide-react-native';
import { Link } from 'expo-router'
const Welcome = () => {
  return (
    <ImageBackground
      source={pick}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <SafeAreaView className='flex-1'>

          {/* Top section - image, no flex-1 so it only takes what it needs */}
          <View className='items-center mt-20 mb-[10rem]'>
             <BookOpenText color='white'
              size={100}
             />
          </View>

          {/* White bottom section */}
          <View className='flex-1 bg-white rounded-t-3xl px-8 pt-8 pb-10'>

            {/* EDUCONNECT badge */}
            <View className='flex-row items-center gap-2 mb-4 items-center'>
              <BookOpenText size={16} color='#b45309' />
              <Text className='text-amber-700 font-semibold tracking-widest text-xs '>
                EDUCONNECT
              </Text>
            </View>

            {/* Heading */}
            <Text className='text-3xl font-bold text-gray-900 mb-3'>
              Learn Anywhere.{'\n'}Grow Together.
            </Text>

            {/* Subtext */}
            <Text className='text-gray-500 text-sm mb-6'>
              Smart learning made for African classrooms, homes, and journeys in between.
            </Text>

            {/* Offline badge */}
            <View className='flex-row items-center gap-2 mb-6'>
              <WifiOff size={16} color='#6b7280' />
              <Text className='text-gray-500 text-sm'>
                Download lessons for offline learning
              </Text>
            </View>

            {/* Get Started Button */}
            <Link href="/(auth)/login" asChild>
            <TouchableOpacity className='bg-amber-700 rounded-full py-4 items-center mt-10'>
              <Text className='text-white font-bold text-base'>
                Get Started
              </Text>
            </TouchableOpacity>
            </Link>

          </View>

        </SafeAreaView>
      </View>
    </ImageBackground>
  )
}

export default Welcome