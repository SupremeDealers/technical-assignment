-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "task_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "column_id" TEXT NOT NULL,
    "task_order" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Task_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "Column" ("column_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("author_id", "column_id", "created_at", "description", "name", "priority", "status", "task_id", "updated_at") SELECT "author_id", "column_id", "created_at", "description", "name", "priority", "status", "task_id", "updated_at" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_column_id_idx" ON "Task"("column_id");
CREATE INDEX "Task_author_id_idx" ON "Task"("author_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
