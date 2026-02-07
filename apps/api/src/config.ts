export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  jwtExpiresIn: "7d",
  bcryptRounds: 10,
  dbPath: process.env.DB_PATH ?? "./data/teamboards.db",
};
