import mongoose from 'mongoose';
import Counter from './Counter.js';

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Hardware', 'Software', 'Billing', 'Network', 'Other'], required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

// Auto-generate ticketNumber before saving a new document
ticketSchema.pre('save', async function () { // Removed the 'next' parameter
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'ticketNumber' },
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true } // Fixed the deprecation warning here
      );
      // Format to TKT-001, TKT-042, etc.
      this.ticketNumber = `TKT-${counter.seq.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error("Counter Error:", error);
      throw error; // Use 'throw' instead of 'next(error)' in modern async hooks
    }
  }
});

export default mongoose.model('Ticket', ticketSchema);