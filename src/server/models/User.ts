import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    avatar: { type: String, default: '' },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    socketId: String,
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
