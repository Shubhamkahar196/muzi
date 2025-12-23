/*
  Warnings:

  - You are about to drop the column `bigUrl` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `smallUrl` on the `Stream` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "bigUrl",
DROP COLUMN "smallUrl",
ADD COLUMN     "bigImg" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "smallImg" TEXT NOT NULL DEFAULT '';
