import mongoose, { Document } from "mongoose";
export interface IUserPreferences extends Document {
    userId: mongoose.Types.ObjectId;
    lang: string;
    region: {
        code: string;
        name: string;
        language: string;
    };
    dateFormat: string;
    timeFormat: string;
    theme: "light" | "dark" | "glass";
    fontSize: "small" | "medium" | "large";
    audioVideo: {
        autoPlayVideos: boolean;
        autoPlayOnWifiOnly: boolean;
        muteByDefault: boolean;
        showSubtitles: boolean;
        hdOnWifi: boolean;
        videoQuality: "auto" | "360p" | "720p" | "1080p";
        enableAudioNews: boolean;
        backgroundAudio: boolean;
        voiceSpeed: "0.75x" | "1x" | "1.25x" | "1.5x" | "2x";
    };
}
export declare const UserPreferences: mongoose.Model<IUserPreferences, {}, {}, {}, mongoose.Document<unknown, {}, IUserPreferences, {}, {}> & IUserPreferences & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=UserPreferences.d.ts.map