import { configDotenv } from "dotenv";
import { cleanEnv, port, str } from "envalid";

configDotenv();

export const Env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["test", "development", "staging", "production"],
  }),
  PORT: port({ default: 8000 }),
  JWT_ACCESS_SECRET: str(),
  JWT_ACCESS_EXPIRY: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_REFRESH_EXPIRY: str(),
  DATABASE_URL: str(),
  FRONTEND_URL: str(),
});

export type AppConfig = typeof Env;

export const appConfig = () => ({ ...Env });
