const express = require("express");
const {
  getMe,
  updateProfile,
  updateStats,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/me", getMe);
router.put("/me", updateProfile);
router.put("/stats", updateStats);

module.exports = router;
