import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '../types/index.js';
import type { CallbackWithoutResultAndOptionalError } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  author_id?: string;
  created_at: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['author', 'admin'],
      required: true,
    },
    author_id: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

// explicitly type next as CallbackWithoutResultAndOptionalError
// fixes the SaveOptions type conflict in newer Mongoose versions
UserSchema.pre('save', async function (
  this: IUser,
  next: CallbackWithoutResultAndOptionalError
) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);