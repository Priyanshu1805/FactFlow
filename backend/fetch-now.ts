import mongoose from 'mongoose';
import { fetchAllNewsNow } from './services/newsCronService';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');
    await fetchAllNewsNow();
    console.log('Done!');
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
