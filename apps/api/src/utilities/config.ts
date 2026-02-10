import { configDotenv } from "dotenv";
configDotenv();

export const JWT =  process.env.JWT_SECRET!;

