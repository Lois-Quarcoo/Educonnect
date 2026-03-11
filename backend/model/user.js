const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  // User Stats
  streak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  totalLearningTime: {
    type: Number,
    default: 0, // in minutes
  },
  quizzesCompleted: {
    type: Number,
    default: 0,
  },
  videosWatched: {
    type: Number,
    default: 0,
  },
  // Settings
  preferences: {
    language: {
      type: String,
      default: "en",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "auto",
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Explicitly enforce unique index on email at the DB level
userSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Update the updatedAt timestamp before saving
userSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);