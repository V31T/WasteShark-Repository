const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

async function connectMongo() {
  if (!mongo) {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri); // No deprecated options needed
  }
  return mongo;
}

async function disconnectMongo() {
  if (mongo) {
    await mongoose.disconnect();
    await mongo.stop();
    mongo = null;
  }
}

function getMongo() {
  if (!mongo) throw new Error("MongoMemoryServer not started yet");
  return mongo;
}

module.exports = { connectMongo, disconnectMongo, getMongo };
