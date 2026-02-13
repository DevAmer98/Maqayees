-- CreateTable
CREATE TABLE "DriverChecklist" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehiclePlate" TEXT,
    "shiftId" TEXT,
    "record" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverChecklist_driverId_updatedAt_idx" ON "DriverChecklist"("driverId", "updatedAt");

-- AddForeignKey
ALTER TABLE "DriverChecklist" ADD CONSTRAINT "DriverChecklist_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
