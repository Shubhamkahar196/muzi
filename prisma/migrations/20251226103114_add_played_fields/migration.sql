-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "played" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playedTs" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Stream_userId_active_played_idx" ON "Stream"("userId", "active", "played");

-- CreateIndex
CREATE INDEX "Stream_createAt_idx" ON "Stream"("createAt");
