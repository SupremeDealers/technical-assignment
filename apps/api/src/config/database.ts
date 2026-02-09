import { Sequelize } from "sequelize";
import { config } from "../config";

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: "postgres",

    logging: config.nodeEnv === "development" ? console.log : false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    dialectOptions:
      config.nodeEnv === "production"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
  }
);

export default sequelize;
