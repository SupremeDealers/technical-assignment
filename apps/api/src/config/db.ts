import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
      maxPoolSize: 10, 
    });

    isConnected = true;
    console.log("[Mongose!] MongoDB connected");
  } catch (err) {
    console.error("[Mongose!] MongoDB connection failed");
    
    if (env.NODE_ENV !== "production") {
      console.error(err);
    }
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("[Mongose!] MongoDB disconnected");
  } catch (err) {
    console.error("[Mongose!] MongoDB disconnect error:", err);
  }
}

export function setupDBShutdownHooks() {
  const shutdown = async () => {
    await disconnectDB();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("SIGQUIT", shutdown);
}
