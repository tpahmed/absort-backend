import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import passport from "passport";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Verify reCAPTCHA token
const verifyRecaptcha = async (token) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error("reCAPTCHA secret key not configured");
    }

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    return response.data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ message: "reCAPTCHA token is required" });
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ message: "reCAPTCHA token is required" });
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Find user and validate password
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- GOOGLE ---
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth?error=google" }),
  (req, res) => {
    const token = req.user.token;
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Get user profile
router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const fields = ["name", "phone", "address", "city", "zipCode", "country"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Check if new password is different from current
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: "New password must be different from current password" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      message: "Password changed successfully",
      success: true 
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error while changing password" });
  }
});

// Delete account
router.delete("/delete-account", protect, async (req, res) => {
  try {
    const { password } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({ 
        message: "Password is required to delete account" 
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({ 
      message: "Account deleted successfully",
      success: true 
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error while deleting account" });
  }
});

export default router;