import mongoose, { Document } from 'mongoose';
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
export declare const LiveChannel: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=LiveChannel.d.ts.map