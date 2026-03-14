import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { BookOpen, Sparkles } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  return (
    <LinearGradient
      colors={["#8B5CF6", "#06B6D4"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Top Section - Logo and Title */}
          <View style={styles.topSection}>
            {/* Logo Circle */}
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <BookOpen size={48} color="#8B5CF6" />
                <Sparkles size={20} color="#F97316" style={styles.sparks} />
              </View>
            </View>

            {/* App Name */}
            <Text style={styles.appName}>EduConnect</Text>

            {/* Tagline */}
            <Text style={styles.tagline}>Learn Smarter, Together</Text>
          </View>

          {/* Bottom Section - Get Started Button */}
          <View style={styles.bottomSection}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity
                style={styles.getStartedButton}
                activeOpacity={0.8}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
            </Link>

            {/* Loading Indicator */}
            <ActivityIndicator
              size="small"
              color="#F97316"
              style={styles.loadingIndicator}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  topSection: {
    alignItems: "center",
    marginTop: 80,
  },
  logoContainer: {
    width: 128,
    height: 128,
    backgroundColor: "white",
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  logoInner: {
    position: "relative",
  },
  sparks: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 32,
  },
  getStartedButton: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    color: "#8B5CF6",
    fontWeight: "bold",
    fontSize: 18,
  },
  loadingIndicator: {
    marginTop: 24,
  },
});

export default Welcome;
