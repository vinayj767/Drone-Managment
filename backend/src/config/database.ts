import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Try both environment variable names and fallback to hardcoded connection
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://vinayj767:vinayjain@ibm.2jbxbzq.mongodb.net/drone_survey?retryWrites=true&w=majority&appName=IBM';
    
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`MongoDB Connected: ${conn.connection.host} - Database: drone_survey`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};