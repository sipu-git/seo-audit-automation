-- DropForeignKey
ALTER TABLE "Audit" DROP CONSTRAINT "Audit_created_by_fkey";

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
