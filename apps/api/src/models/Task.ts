import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Task = sequelize.define(
  "Task",
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

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    columnId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "columns",
        key: "id",
      },
      onDelete: "CASCADE",
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
    tableName: "tasks",
    paranoid: true,

    indexes: [
      {
        fields: ["columnId"],
      },
      {
        fields: ["boardId"],
      },
      {
        fields: ["columnId", "order"],
      },
    ],
  }
);

export default Task;
