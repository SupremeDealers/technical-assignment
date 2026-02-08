import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), ".env.production")
      : path.resolve(process.cwd(), ".env.development"),
});
