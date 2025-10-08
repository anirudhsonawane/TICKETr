import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  userId: string;
  eventId: string;
  passName?: string;
  quantity: number;
  totalAmount: number;
  paymentId: string;
  qrCode: string;
  status: 'active' | 'scanned' | 'cancelled';
  scannedAt?: Date;
  scannedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  passName: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'scanned', 'cancelled'],
    default: 'active',
  },
  scannedAt: {
    type: Date,
  },
  scannedBy: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
