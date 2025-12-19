-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "isCompany" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "taxId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "dteNumber" INTEGER,
ADD COLUMN     "dteType" TEXT,
ADD COLUMN     "fuelLevel" INTEGER,
ADD COLUMN     "kilometer" INTEGER,
ADD COLUMN     "mechanicId" TEXT,
ADD COLUMN     "netAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "receptionNotes" JSONB,
ADD COLUMN     "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MECHANIC',
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "category" TEXT NOT NULL,
    "netPrice" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 5,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ServiceProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProduct" ADD CONSTRAINT "ServiceProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ServiceProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
