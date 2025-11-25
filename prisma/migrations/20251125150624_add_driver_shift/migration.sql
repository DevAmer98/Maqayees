-- CreateTable
CREATE TABLE "DriverShift" (
    "id" TEXT NOT NULL,
    "driverId" TEXT,
    "driverName" TEXT,
    "driverEmail" TEXT,
    "driverPhone" TEXT,
    "vehicleId" TEXT,
    "vehiclePlate" TEXT,
    "projectName" TEXT,
    "record" JSONB NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverShift_pkey" PRIMARY KEY ("id")
);
