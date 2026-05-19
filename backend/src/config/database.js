const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer = null;

async function connectDatabase() {
  const useMemory =
    process.env.USE_IN_MEMORY_MONGO === 'true' || !process.env.MONGODB_URI;

  let uri = process.env.MONGODB_URI;

  if (useMemory) {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: process.env.MONGODB_DB_NAME || 'altercom'
      }
    });
    uri = memoryServer.getUri();
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || 'altercom'
  });

  console.log(
    useMemory
      ? 'MongoDB en memoire active pour la demo AlterCom.'
      : 'Connexion MongoDB etablie.'
  );
}

async function closeDatabase() {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = {
  closeDatabase,
  connectDatabase
};
