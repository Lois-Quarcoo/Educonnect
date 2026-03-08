import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Calculator,
  Atom,
  BookOpen,
  Landmark,
  Globe,
  Zap,
  Plus,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// ── Progress Ring (pure RN, no SVG dep) ──────────────────────────────────────
const ProgressBadge = ({ percent }: { percent: number }) => (
  <View className="bg-white/25 rounded-full px-2.5 py-1">
    <Text className="text-white font-bold text-xs">{percent}%</Text>
  </View>
);

// ── Subject Card ──────────────────────────────────────────────────────────────
type Subject = {
  title: string;
  lessons: number;
  videos: number;
  quizzes: number;
  progress: number;
  color: string;
  icon: React.ReactNode;
};

const SubjectCard = ({ subject }: { subject: Subject }) => (
  <TouchableOpacity
    activeOpacity={0.88}
    style={{ width: CARD_WIDTH, backgroundColor: subject.color }}
    className="rounded-2xl p-4 mb-3"
    onPress={() => router.push(`/lesson/${subject.title}`)}
  >
    {/* Icon row */}
    <View className="flex-row justify-between items-start">
      <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
        {subject.icon}
      </View>
      <ProgressBadge percent={subject.progress} />
    </View>

    {/* Info */}
    <View className="mt-10">
      <Text className="text-white font-bold text-lg">{subject.title}</Text>
      <Text className="text-white/80 text-xs mt-1 leading-4">
        {subject.lessons} Lessons • {subject.videos} Videos{'\n'}• {subject.quizzes} Quizzes
      </Text>
    </View>
  </TouchableOpacity>
);

// ── Filter Pill ───────────────────────────────────────────────────────────────
const FilterPill = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-5 py-2.5 rounded-full mr-2 ${
      active ? 'bg-purple-700' : 'bg-white'
    }`}
  >
    <Text className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-400'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const ICON_SIZE = 24;
const ICON_COLOR = '#ffffff';

const ALL_SUBJECTS: Subject[] = [
  {
    title: 'Mathematics',
    lessons: 18,
    videos: 12,
    quizzes: 6,
    progress: 64,
    color: '#7C3AED',
    icon: <Calculator size={ICON_SIZE} color={ICON_COLOR} />,
  },
  {
    title: 'Science',
    lessons: 14,
    videos: 8,
    quizzes: 4,
    progress: 42,
    color: '#3B82F6',
    icon: <Atom size={ICON_SIZE} color={ICON_COLOR} />,
  },
  {
    title: 'English',
    lessons: 22,
    videos: 5,
    quizzes: 10,
    progress: 85,
    color: '#EA580C',
    icon: <BookOpen size={ICON_SIZE} color={ICON_COLOR} />,
  },
  {
    title: 'History',
    lessons: 10,
    videos: 15,
    quizzes: 2,
    progress: 15,
    color: '#92400E',
    icon: <Landmark size={ICON_SIZE} color={ICON_COLOR} />,
  },
  {
    title: 'Geography',
    lessons: 16,
    videos: 6,
    quizzes: 8,
    progress: 90,
    color: '#059669',
    icon: <Globe size={ICON_SIZE} color={ICON_COLOR} />,
  },
  {
    title: 'Physics',
    lessons: 12,
    videos: 10,
    quizzes: 5,
    progress: 30,
    color: '#6366F1',
    icon: <Zap size={ICON_SIZE} color={ICON_COLOR} />,
  },
];

const FILTERS = ['All', 'Science', 'Arts', 'Math'];

// ── Screen ────────────────────────────────────────────────────────────────────
const Subjects = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = ALL_SUBJECTS.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  // Pair subjects into rows of 2
  const rows: Subject[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text className="text-4xl font-black text-gray-900 mt-6 mb-5">
          Subjects
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-5 shadow-sm">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="ml-3 flex-1 text-gray-800 text-base"
            placeholder="Search subjects..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {FILTERS.map((f) => (
            <FilterPill
              key={f}
              label={f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </ScrollView>

        {/* Subject Grid */}
        {rows.map((row, i) => (
          <View key={i} className="flex-row justify-between">
            {row.map((subject) => (
              <SubjectCard key={subject.title} subject={subject} />
            ))}
            {/* Fill empty slot if odd number */}
            {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
          </View>
        ))}
      </ScrollView>

      {/* Add Material FAB */}
      <View className="absolute bottom-8 right-5">
        <TouchableOpacity
          className="flex-row items-center bg-purple-700 px-6 py-4 rounded-full shadow-lg"
          activeOpacity={0.85}
        >
          <Plus size={20} color="#fff" />
          <Text className="text-white font-bold text-base ml-2">Add Material</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Subjects;