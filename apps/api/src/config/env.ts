import { config } from "dotenv";
import { z } from "zod";

config();

//* Environment Schema

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((p) => p > 0 && p < 65536, "Invalid port")
    .default("4000"),
  MONGO_URI: z
    .string()
    .url("MONGO_URI must be a valid Mongo connection string"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .refine(
      (val) => !val.toLowerCase().includes("secret"),
      "JWT_SECRET is too weak",
    ),

  JWT_EXPIRES_IN: z.string().default("7d"),
});

//* Parse & Validate

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("[ENIVIORMENT!] Environment validation failed");

  // Hide sensitive values
  parsed.error.issues.forEach((issue) => {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  });

  process.exit(1);
}

//! Freeze to prevent mutation

export const env = Object.freeze(parsed.data);

//! Extra Production Safety

if (env.NODE_ENV === "production") {
  if (env.JWT_SECRET.length < 40) {
    throw new Error("JWT_SECRET too weak for production");
  }
}
