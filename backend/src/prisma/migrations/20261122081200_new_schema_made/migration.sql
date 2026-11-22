-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'LOCAL');

-- AlterTable
ALTER TABLE "Auth" ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "revoked" TIMESTAMP(3),

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_authorId_key" ON "Account"("authorId");

-- CreateIndex
CREATE INDEX "Account_authorId_idx" ON "Account"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Sessions_refreshToken_key" ON "Sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "Sessions_authorId_idx" ON "Sessions"("authorId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
