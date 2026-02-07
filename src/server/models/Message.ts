import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
    file: {
      filename: String,
      originalName: String,
      url: String,
      size: Number,
      mimetype: String,
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
