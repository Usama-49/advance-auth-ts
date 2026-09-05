import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("DB Connected Successfully ✅");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
};

export const disConnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("DB Disconnected Successfully ✔️");
  } catch (err) {
    console.error("🚫 DB Disconnection Error:", err);
    process.exit(1);
  }
};
