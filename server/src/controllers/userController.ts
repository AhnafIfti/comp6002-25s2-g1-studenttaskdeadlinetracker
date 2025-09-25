import { Request, Response } from 'express';
import User from '../model/user'; // Import the user model
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

// Register a new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists.' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Login user controller
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    // Return user data and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Handle Google OAuth authentication
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName, googleId } = req.body;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({
        firstName,
        lastName,
        email,
        googleId,
        isGoogleUser: true,
      });
      await user.save();
    } else if (!user.googleId) {
      // If user exists but doesn't have a Google ID, update the user
      user.googleId = googleId;
      user.isGoogleUser = true;
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '24h' }
    );
    
    // Return user information and token
    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    // Log and handle errors
    console.error('Google authentication error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : 
        undefined
    });
  }
};


import Course from "../model/course";

export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const courses = await Course.find({ userId }).select("name code");

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      courses,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, email, password } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


export const deleteUserAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User account deleted successfully." });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};