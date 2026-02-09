import User from "./User";
import Board from "./Board";
import Column from "./Column";
import Task from "./Task";
import Comment from "./Comment";

export const initModels = () => {
  // User -> Boards
  User.hasMany(Board, {
    foreignKey: "userId",
    as: "boards",
    onDelete: "CASCADE",
  });

  Board.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Board -> Columns
  Board.hasMany(Column, {
    foreignKey: "boardId",
    as: "columns",
    onDelete: "CASCADE",
  });

  Column.belongsTo(Board, {
    foreignKey: "boardId",
    as: "board",
  });

  // Column -> Tasks
  Column.hasMany(Task, {
    foreignKey: "columnId",
    as: "tasks",
    onDelete: "CASCADE",
  });

  Task.belongsTo(Column, {
    foreignKey: "columnId",
    as: "column",
  });

  // Board -> Tasks
  Board.hasMany(Task, {
    foreignKey: "boardId",
    as: "tasks",
    onDelete: "CASCADE",
  });

  Task.belongsTo(Board, {
    foreignKey: "boardId",
    as: "board",
  });

  // Task -> Comments
  Task.hasMany(Comment, {
    foreignKey: "taskId",
    as: "comments",
    onDelete: "CASCADE",
  });

  Comment.belongsTo(Task, {
    foreignKey: "taskId",
    as: "task",
  });

  // User -> Comments
  User.hasMany(Comment, {
    foreignKey: "userId",
    as: "comments",
    onDelete: "CASCADE",
  });

  Comment.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });
};

export { User, Board, Column, Task, Comment };
