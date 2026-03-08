import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  Info,
  Paperclip,
  Camera,
  BookOpen,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  suggestions?: string[];
  lessonCard?: { subject: string; title: string; meta: string };
};

// ── Lesson Card ───────────────────────────────────────────────────────────────
const LessonCard = ({
  subject,
  title,
  meta,
}: {
  subject: string;
  title: string;
  meta: string;
}) => (
  <View className="mt-3 bg-white rounded-xl p-3 flex-row items-center shadow-sm border border-gray-100">
    <View className="w-9 h-9 rounded-lg bg-purple-100 items-center justify-center mr-3">
      <BookOpen size={18} color="#7C3AED" />
    </View>
    <View>
      <Text className="text-purple-600 font-bold text-xs tracking-widest uppercase">
        {subject}
      </Text>
      <Text className="text-gray-900 font-semibold text-sm mt-0.5">{title}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{meta}</Text>
    </View>
  </View>
);

// ── Suggestion Pill ───────────────────────────────────────────────────────────
const SuggestionPill = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="self-start bg-purple-50 border border-purple-200 rounded-full px-4 py-2 mb-2"
    activeOpacity={0.75}
  >
    <Text className="text-purple-700 text-sm">{label}</Text>
  </TouchableOpacity>
);

// ── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user';
  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      {!isUser && (
        <View className="flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center mr-2 mt-1">
            <Sparkles size={14} color="#fff" />
          </View>
          <View style={{ maxWidth: width * 0.72 }}>
            <View className="bg-purple-50 rounded-2xl rounded-tl-sm px-4 py-3">
              <Text className="text-gray-800 text-sm leading-5">{msg.text}</Text>
              {msg.lessonCard && (
                <LessonCard
                  subject={msg.lessonCard.subject}
                  title={msg.lessonCard.title}
                  meta={msg.lessonCard.meta}
                />
              )}
            </View>
            {msg.suggestions && (
              <View className="mt-3 ml-1">
                {msg.suggestions.map((s) => (
                  <SuggestionPill key={s} label={s} onPress={() => {}} />
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {isUser && (
        <View
          style={{ maxWidth: width * 0.72 }}
          className="bg-purple-700 rounded-2xl rounded-tr-sm px-4 py-3"
        >
          <Text className="text-white text-sm leading-5">{msg.text}</Text>
        </View>
      )}
    </View>
  );
};

// ── Initial Messages ──────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'ai',
    text: "Hi Sarah! 👋 I'm your AI Tutor. I can answer questions, summarize your uploaded notes, or quiz you on any subject. How can I help you today?",
    suggestions: [
      'Explain photosynthesis',
      'Quiz me on algebra',
      'Summarize this video',
      'Help with my homework',
    ],
  },
  {
    id: '2',
    role: 'user',
    text: 'Can you help me understand linear equations?',
  },
  {
    id: '3',
    role: 'ai',
    text: "I'd be happy to help! A great place to start is this lesson from your Mathematics library:",
    lessonCard: {
      subject: 'Mathematics',
      title: 'Introduction to Algebra',
      meta: 'Lesson • 15 min',
    },
  },
];

// ── Screen ────────────────────────────────────────────────────────────────────
const AITutor = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
    };
    const aiReply: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      text: "That's a great question! Let me look that up for you and put together a clear explanation.",
    };

    setMessages((prev) => [...prev, userMsg, aiReply]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
          <View className="w-8" />
          <View className="flex-row items-center">
            <Text className="text-gray-900 font-bold text-base mr-1">AI Tutor</Text>
            <Sparkles size={16} color="#F59E0B" />
          </View>
          <TouchableOpacity className="w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm">
            <Info size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* ── Messages ── */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <View className="h-4" />
        </ScrollView>

        {/* ── Input Bar ── */}
        <View className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
          <View className="flex-row items-center bg-white rounded-full px-4 py-2.5 shadow-sm border border-gray-100">
            <TouchableOpacity className="mr-2" hitSlop={8}>
              <Paperclip size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="mr-3" hitSlop={8}>
              <Camera size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TextInput
              className="flex-1 text-gray-800 text-sm"
              placeholder="Ask me anything..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              multiline
            />
            <TouchableOpacity
              onPress={sendMessage}
              className="ml-2 bg-purple-600 rounded-full px-4 py-2 flex-row items-center"
              activeOpacity={0.85}
            >
              <Sparkles size={14} color="#fff" />
              <Text className="text-white font-bold text-sm ml-1">Go</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AITutor;