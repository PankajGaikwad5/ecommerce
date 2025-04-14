import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: false, // Make this field optional
      default: null,
    },
    role: { type: String, default: 'user' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
