-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "label" TEXT NOT NULL DEFAULT 'Home',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '';
