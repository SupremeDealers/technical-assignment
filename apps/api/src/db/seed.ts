import { connectDB, disconnectDB } from "../config/db";
import { User } from "../modules/auth/auth.model";
import { hashPassword } from "../utils/hash";

async function seed() {
  try {
    console.log("[DB] Starting database seed...");

    await connectDB();

    //! Clear existing data
    await User.deleteMany({});
    console.log("[INFO] Cleared existing users");

    //* Create demo users
    const demoUsers = [
      {
        email: "admin@example.com",
        password: await hashPassword("password123"),
        name: "Admin User",
      },
      {
        email: "john@example.com",
        password: await hashPassword("password123"),
        name: "John Doe",
      },
      {
        email: "jane@example.com",
        password: await hashPassword("password123"),
        name: "Jane Smith",
      },
    ];

    await User.insertMany(demoUsers);
    console.log(`[INFO] Created ${demoUsers.length} demo users`);

    console.log("\n[SUCCESS] Seed completed successfully!");
    console.log("\nDemo credentials:");
    console.log("  Email: admin@example.com");
    console.log("  Password: password123\n");
  } catch (error) {
    console.error("[FAILED]Seed failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

seed();
