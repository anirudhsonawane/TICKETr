import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  image?: string;
  provider: 'google' | 'phone';
  googleId?: string;
  phoneVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    sparse: true,
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    enum: ['google', 'phone'],
    required: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
