import mongoose, { Document, Schema } from 'mongoose';

export interface ILiveChannel extends Document {
  id: string;
  name: string;
  youtubeHandle: string;
  currentVideoId?: string;
  short: string;
  color: string;
  category: 'Indian' | 'Global' | 'Business';
  lastUpdated: Date;
}

const LiveChannelSchema = new Schema<ILiveChannel>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  youtubeHandle: { type: String, required: true },
  currentVideoId: { type: String },
  short: { type: String, required: true },
  color: { type: String, required: true },
  category: { type: String, enum: ['Indian', 'Global', 'Business'], required: true },
  lastUpdated: { type: Date, default: Date.now }
});

export const LiveChannel = mongoose.models.LiveChannel || mongoose.model<ILiveChannel>('LiveChannel', LiveChannelSchema);
