import mongoose from 'mongoose';
const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    avatar: { type: String, default: '' },
    isGroup: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Group', groupSchema);
