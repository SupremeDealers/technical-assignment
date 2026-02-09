import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Board = sequelize.define(
  "Board",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "boards",
    paranoid: true,

    indexes: [
      {
        fields: ["userId"],
      },
    ],
  }
);

export default Board;
