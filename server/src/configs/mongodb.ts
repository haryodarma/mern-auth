import mongoose from "mongoose";

const connectDB = async () => {
  console.log(`${process.env.MONGODB_URI}mern-auth`);
  try {
    await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}?authSource=${process.env.AUTH_SOURCE}`
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
