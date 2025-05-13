import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 * 
 * MONGODB_URI=mongodb+srv://{username}:{password}@cluster0.lo3cgvx.mongodb.net/{database}
 */
const connectMongoDb = async (options = {}): Promise<void> => {
  try {
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || "", options);
    
    console.log(`MongoDB Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1); // Exit process with failure
  }
};

export { connectMongoDb };
