import app from "./app";
import { config } from "./config";
import sequelize from "./config/database";
import { initModels } from "./models";

const startServer = async () => {
  try {
    // Initialize associations
    initModels();

    // Test database connection
    await sequelize.authenticate();
    console.log("✓ Database connection established successfully");

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`✓ Server running on port ${config.port}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ Health check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\nShutting down server...");

      await sequelize.close();
      server.close(() => {
        console.log("✓ Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("✗ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
