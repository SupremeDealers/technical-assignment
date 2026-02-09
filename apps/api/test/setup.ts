import { afterAll, beforeAll } from "vitest";
import sequelize from "../src/config/database";

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
