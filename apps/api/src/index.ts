import { createApp } from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env } from "./config/env";
import http from "http";

async function start() {
  try {
//! Connect to Database
    await connectDB();

 //! Create Express App
    const app = createApp();
    const PORT = Number(env.PORT) || 4000;

    const server = http.createServer(app);

//! Start Server
    server.listen(PORT, () => {
      console.log(`[SERVER] Server running on http://localhost:${PORT}`);
      console.log(`[ENV] Environment: ${env.NODE_ENV}`);
    });

//! Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n[SERVER] Received ${signal}. Shutting down...`);

      server.close(async () => {
        await disconnectDB();
        console.log("[SERVER] DB disconnected");
        console.log("[SERVER]   Server stopped");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

//* Handle Unhandled Rejections and Exceptions
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("[SERVER]Failed to start server");
    if (env.NODE_ENV !== "production") {
      console.error(error);
    }
    process.exit(1);
  }
}

start();
