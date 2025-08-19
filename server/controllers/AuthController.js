import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { promises as fs } from "fs";
import path from "path";

// Helper function to ensure upload directory exists
const ensureUploadsDir = async () => {
  const uploadsPath = path.join(process.cwd(), 'uploads', 'profiles');
  try {
    await fs.mkdir(uploadsPath, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
};

// Token creation helper
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: '3d'
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email already exists"
      });
    }

    const user = await User.create({ email, password });
    const token = createToken(email, user._id);

    res.cookie("jwt", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return res.status(201).json({
      status: "success",
      message: "Successfully registered",
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    const token = createToken(email, user._id);

    res.cookie("jwt", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User found",
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, color } = req.body;
    
    if (!firstName || !lastName || color === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'First name, last name and color are required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId, 
      {
        firstName,
        lastName,
        color,
        profileSetup: true
      }, 
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color
      }
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export const addProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: "File is required"
      });
    }

    await ensureUploadsDir();
    
    const date = Date.now();
    const ext = path.extname(req.file.originalname);
    const fileName = `uploads/profiles/${date}${ext}`;
    const filePath = path.join(process.cwd(), fileName);

    await fs.rename(req.file.path, filePath);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      { image: fileName }, 
      { new: true, runValidators: true }
    );

    return res.status(200).json({   
      status: "success",
      message: "Profile image updated successfully",
      image: updatedUser.image
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload image"
    });
  }
};

export const removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.image) {
      return res.status(400).json({
        status: 'error',
        message: 'No profile image to remove'
      });
    }

    try {
      await fs.unlink(path.join(process.cwd(), user.image));
    } catch (err) {
      console.error("Error deleting image file:", err);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $unset: { image: 1 } },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Profile image removed successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Remove image error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie by setting it to empty with immediate expiration
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"  // Ensures cookie is cleared from all paths
    });


    return res.status(200).json({
      status: "success",
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during logout"
    });
  }
};