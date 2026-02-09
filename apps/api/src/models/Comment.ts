import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
      onDelete: "CASCADE",
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
    tableName: "comments",
    paranoid: true,

    indexes: [
      {
        fields: ["taskId"],
      },
      {
        fields: ["userId"],
      },
    ],
  }
);

export default Comment;
