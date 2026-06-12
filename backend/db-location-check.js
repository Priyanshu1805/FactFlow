const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const counts = await mongoose.connection.db.collection('newsarticles').aggregate([
    { $group: { _id: '$location', count: { $sum: 1 } } }
  ]).toArray();
  console.log("Location counts:", counts);
  process.exit(0);
}
run();
