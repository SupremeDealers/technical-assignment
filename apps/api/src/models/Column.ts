import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Column = sequelize.define(
  "Column",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    boardId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "boards",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "columns",
    paranoid: true,

    indexes: [
      {
        fields: ["boardId"],
      },
      {
        fields: ["boardId", "order"],
      },
    ],
  }
);

export default Column;
