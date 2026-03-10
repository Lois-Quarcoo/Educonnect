const User = require("../model/user");

// @desc    Get current user profile
// @route   GET /api/user/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user stats
// @route   PUT /api/user/stats
// @access  Private
exports.updateStats = async (req, res) => {
  try {
    const { learningTime, quizCompleted, videoWatched } = req.body;

    const user = await User.findById(req.user._id);

    if (learningTime) user.totalLearningTime += learningTime;
    if (quizCompleted) user.quizzesCompleted += 1;
    if (videoWatched) user.videosWatched += 1;

    // Update streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActive = new Date(user.lastActiveDate).setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      user.streak += 1;
    } else if (daysDiff > 1) {
      user.streak = 1;
    }

    user.lastActiveDate = Date.now();
    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
