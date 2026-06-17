import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['customer', 'admin'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Required Index: Compound index for efficient ?since= polling
messageSchema.index({ ticketId: 1, timestamp: 1 });

export default mongoose.model('Message', messageSchema);