// mongoose is the ODM (Object Document Mapper) that lets us
// talk to MongoDB using JavaScript objects instead of raw queries
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // process.env reads from your .env file (loaded via dotenv)
    const uri = process.env.MONGODB_URI;

    // TypeScript forces us to handle the case where env var is missing
    // In JS you'd only find this bug at runtime when mongo throws
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit the process entirely if DB fails — app is useless without DB
    process.exit(1);
  }
};

export default connectDB;