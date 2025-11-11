import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URL || process.env.MONGODB_URI;
console.log('MongoDB URI:', uri ? 'Found' : 'Missing');

if (!uri) {
  throw new Error("Please define MONGODB_URL or MONGODB_URI in your .env.local file");
}

console.log('MongoDB connection starting...');

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

// For NextAuth (native driver)
let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    console.log('Creating new MongoDB client for development...');
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  console.log('Creating new MongoDB client for production...');
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// For NextAuth MongoDBAdapter - it expects a promise that resolves to { client, db }
const nextAuthClientPromise = clientPromise.then((client) => {
  console.log('🔍 NextAuth clientPromise resolved, client:', !!client);
  try {
    const db = client.db();
    console.log('✅ NextAuth database created:', !!db);
    return {
      client,
      db,
    };
  } catch (error) {
    console.error('❌ NextAuth database creation error:', error);
    throw error;
  }
}).catch((error) => {
  console.error('❌ NextAuth clientPromise error:', error);
  throw error;
});

// For Mongoose (ensure single connection)
const mongooseOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false, // Disable mongoose buffering
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Initialize MongoDB connection at startup
let isConnected = false;

async function connectMongoose() {
  console.log('🔍 connectMongoose() called from:', new Error().stack.split('\n')[2]);
  
  if (cached.conn && isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Establishing new MongoDB connection...');
    cached.promise = mongoose.connect(uri, mongooseOpts).then((mongoose) => {
      isConnected = true;
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error);
      isConnected = false;
      throw error;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connection established and cached');
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

// Initialize connection at startup
console.log('🚀 Initializing MongoDB connection at startup...');
connectMongoose().catch((error) => {
  console.error('❌ Startup MongoDB connection failed:', error);
});

export { clientPromise, nextAuthClientPromise, connectMongoose };
