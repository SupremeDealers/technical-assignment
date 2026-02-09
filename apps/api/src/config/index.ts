import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Environment schema
 */
const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("5432"),
  DB_NAME: z.string().optional(),
  TEST_DB_NAME: z.string().optional(),
  DB_USER: z.string().default("postgres"),
  DB_PASS: z.string().default("postgres"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

/**
 * Parse + validate
 */
const env = envSchema.parse(process.env);

console.log("env.NODE_ENV",env.NODE_ENV);


export const config = {
  port: Number(env.PORT || 4000),
  nodeEnv: env.NODE_ENV,

  database: {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    name:
      env.NODE_ENV === "test"
        ? env.TEST_DB_NAME || "kanban_test_db"
        : env.DB_NAME || "kanban_db",
    user: env.DB_USER,
    password: env.DB_PASS,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
};
