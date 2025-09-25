import mongoose, { Schema, Document } from 'mongoose';
import Course from "./course"; 

// Define the user interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  googleId?: string;
  isGoogleUser?: boolean;
}

// Define the user schema
const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true, maxlength: 50 }, // First name of the user
    lastName: { type: String, required: true, maxlength: 50 },  // Last name of the user
    email: { type: String, required: true, unique: true },      // User's email address
    password: { type: String},                // Hashed password
    googleId: { type: String },
    isGoogleUser: { type: Boolean, default: false }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

UserSchema.pre("findOneAndDelete", async function (next) {
  const userId = this.getQuery()["_id"];
  if (userId) {
    await Course.deleteMany({ userId });
  }
  next();
});

// Create the user model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;