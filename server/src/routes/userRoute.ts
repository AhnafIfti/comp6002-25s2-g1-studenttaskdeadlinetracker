import express from 'express';
import { registerUser, loginUser, googleAuth, getUserProfile, updateUserProfile, deleteUserAccount } from '../controllers/userController'; // Import the registerUser controller
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

router.post('/login',loginUser)

router.post('/google-auth',googleAuth);

router.put("/profile", authenticate, updateUserProfile);

router.delete("/profile", authenticate, deleteUserAccount);

router.get("/profile", authenticate, getUserProfile);



export default router;