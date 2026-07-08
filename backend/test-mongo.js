const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://usaomega1_db_user:pAXhs9LKMA9qs180@cluster0.zpedlcp.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

async function run() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ Connection failed with error:");
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
