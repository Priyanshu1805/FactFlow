const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const counts = await mongoose.connection.db.collection('newsarticles').aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]).toArray();
  console.log("Category counts:", counts);

  const total = await mongoose.connection.db.collection('newsarticles').countDocuments();
  console.log("Total articles:", total);

  process.exit(0);
}
run();
