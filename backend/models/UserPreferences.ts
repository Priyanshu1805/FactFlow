import mongoose, { Document, Schema } from "mongoose"

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId
  lang: string
  region: {
    code: string
    name: string
    language: string
  }
  dateFormat: string
  timeFormat: string
  theme: "light" | "dark" | "glass"
  fontSize: "small" | "medium" | "large"
  audioVideo: {
    autoPlayVideos: boolean
    autoPlayOnWifiOnly: boolean
    muteByDefault: boolean
    showSubtitles: boolean
    hdOnWifi: boolean
    videoQuality: "auto" | "360p" | "720p" | "1080p"
    enableAudioNews: boolean
    backgroundAudio: boolean
    voiceSpeed: "0.75x" | "1x" | "1.25x" | "1.5x" | "2x"
  }
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    lang: { type: String, default: "en" },
    region: {
      code: { type: String, default: "IN" },
      name: { type: String, default: "India" },
      language: { type: String, default: "English" }
    },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    timeFormat: { type: String, default: "12-hour" },
    theme: { type: String, enum: ["light", "dark", "glass"], default: "dark" },
    fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    audioVideo: {
      autoPlayVideos: { type: Boolean, default: true },
      autoPlayOnWifiOnly: { type: Boolean, default: true },
      muteByDefault: { type: Boolean, default: true },
      showSubtitles: { type: Boolean, default: false },
      hdOnWifi: { type: Boolean, default: true },
      videoQuality: { type: String, enum: ["auto", "360p", "720p", "1080p"], default: "auto" },
      enableAudioNews: { type: Boolean, default: false },
      backgroundAudio: { type: Boolean, default: false },
      voiceSpeed: { type: String, enum: ["0.75x", "1x", "1.25x", "1.5x", "2x"], default: "0.75x" },
    },
  },
  { timestamps: true }
)

export const UserPreferences = mongoose.model<IUserPreferences>("UserPreferences", UserPreferencesSchema)
