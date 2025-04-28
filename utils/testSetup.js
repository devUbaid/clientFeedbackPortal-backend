import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

// Create in-memory MongoDB server for testing
let mongoServer

// Connect to the in-memory database
export const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()

  await mongoose.connect(uri)
}

// Disconnect and close connection
export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}

// Clear all data between tests
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
}
