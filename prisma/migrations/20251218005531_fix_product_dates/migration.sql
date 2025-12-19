/*
  Warnings:

  - You are about to drop the column `dteNumber` on the `WorkOrder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId,taxId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,code]` on the table `ServiceProduct` will be added. If there are existing duplicate values, this will fail.
  - Made the column `taxId` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `ServiceProduct` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `ServiceProduct` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "taxId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ServiceProduct" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "dteNumber";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_taxId_key" ON "Customer"("tenantId", "taxId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProduct_tenantId_code_key" ON "ServiceProduct"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Vehicle_plateOrSerial_idx" ON "Vehicle"("plateOrSerial");

-- CreateIndex
CREATE INDEX "WorkOrder_number_idx" ON "WorkOrder"("number");

-- CreateIndex
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");

-- CreateIndex
CREATE INDEX "WorkOrder_vehicleId_idx" ON "WorkOrder"("vehicleId");
