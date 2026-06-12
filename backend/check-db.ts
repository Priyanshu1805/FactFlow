import mongoose from 'mongoose';
import { NewsArticle } from './models/NewsArticle';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const counts = await mongoose.connection.db!.collection('newsarticles').aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]).toArray();
  console.log(counts);
  process.exit(0);
}
run();
