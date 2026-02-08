/*
  Warnings:

  - You are about to drop the column `title` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Column` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Task` table. All the data in the column will be lost.
  - Added the required column `name` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Column` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Board" (
    "board_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "owner_id" TEXT NOT NULL,
    CONSTRAINT "Board_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Board" ("board_id", "created_at", "description", "owner_id", "updated_at") SELECT "board_id", "created_at", "description", "owner_id", "updated_at" FROM "Board";
DROP TABLE "Board";
ALTER TABLE "new_Board" RENAME TO "Board";
CREATE UNIQUE INDEX "Board_owner_id_board_id_key" ON "Board"("owner_id", "board_id");
CREATE TABLE "new_Column" (
    "column_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "board_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Column_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board" ("board_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Column" ("board_id", "column_id", "created_at", "position", "updated_at") SELECT "board_id", "column_id", "created_at", "position", "updated_at" FROM "Column";
DROP TABLE "Column";
ALTER TABLE "new_Column" RENAME TO "Column";
CREATE INDEX "Column_board_id_idx" ON "Column"("board_id");
CREATE TABLE "new_Task" (
    "task_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "column_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Task_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "Column" ("column_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("author_id", "column_id", "created_at", "description", "priority", "status", "task_id", "updated_at") SELECT "author_id", "column_id", "created_at", "description", "priority", "status", "task_id", "updated_at" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_column_id_idx" ON "Task"("column_id");
CREATE INDEX "Task_author_id_idx" ON "Task"("author_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
