-- CreateTable
CREATE TABLE "MaintenanceJobCardSnapshot" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "info" JSONB NOT NULL,
    "repairs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceJobCardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceJobCardSnapshot_requestId_key" ON "MaintenanceJobCardSnapshot"("requestId");
