/*
  Warnings:

  - You are about to drop the column `description` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Board` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Board" (
    "board_id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "owner_id" TEXT NOT NULL,
    CONSTRAINT "Board_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Board" ("board_id", "created_at", "owner_id", "updated_at") SELECT "board_id", "created_at", "owner_id", "updated_at" FROM "Board";
DROP TABLE "Board";
ALTER TABLE "new_Board" RENAME TO "Board";
CREATE UNIQUE INDEX "Board_owner_id_key" ON "Board"("owner_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
