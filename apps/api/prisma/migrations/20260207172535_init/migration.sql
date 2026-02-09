/*
  Warnings:

  - A unique constraint covering the columns `[owner_id,board_id]` on the table `Board` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Board_owner_id_board_id_key" ON "Board"("owner_id", "board_id");
