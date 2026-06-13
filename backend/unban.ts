import mongoose from "mongoose"

const uri = "mongodb://factflow1819_db_user:fDruid0koXKLuADU@ac-uxi9gf0-shard-00-00.aw3b4pj.mongodb.net:27017,ac-uxi9gf0-shard-00-02.aw3b4pj.mongodb.net:27017,ac-uxi9gf0-shard-00-01.aw3b4pj.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0"

async function unbanAll() {
  try {
    await mongoose.connect(uri)
    console.log("Connected to live MongoDB.")
    
    // The collection name is usually "blockedips" based on mongoose pluralization
    const result = await mongoose.connection.collection("blockedips").deleteMany({})
    console.log(`Unbanned ${result.deletedCount} IPs.`)
    
    // Also clear security logs to be clean
    const logResult = await mongoose.connection.collection("securitylogs").deleteMany({})
    console.log(`Cleared ${logResult.deletedCount} security logs.`)

    await mongoose.disconnect()
    console.log("Done.")
  } catch (err) {
    console.error("Error:", err)
  }
}

unbanAll()
