-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('LIBERADO', 'EM_MANUTENCAO', 'INDISPONIVEL', 'VENDIDO');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('DIESEL', 'DIESEL_S10', 'GASOLINA', 'ETANOL', 'ARLA32');

-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('ONIBUS', 'VAN', 'CARRO', 'CAMINHAO');

-- CreateEnum
CREATE TYPE "VehicleClassification" AS ENUM ('PREMIUM', 'BASIC', 'EXECUTIVO');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'GRAVE');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "internalId" TEXT,
    "plate" TEXT NOT NULL,
    "renavam" TEXT,
    "chassis" TEXT,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "category" "VehicleCategory" NOT NULL,
    "classification" "VehicleClassification" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "doors" INTEGER NOT NULL DEFAULT 1,
    "fuelType" "FuelType" NOT NULL,
    "state" TEXT,
    "currentKm" INTEGER NOT NULL DEFAULT 0,
    "status" "VehicleStatus" NOT NULL DEFAULT 'LIBERADO',
    "companyName" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuelings" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "provider" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "odometer" INTEGER NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuelings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "title" TEXT,
    "classification" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_documents" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "alertDays" INTEGER,
    "activeAlert" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_internalId_key" ON "vehicles"("internalId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_renavam_key" ON "vehicles"("renavam");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_chassis_key" ON "vehicles"("chassis");

-- AddForeignKey
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuelings" ADD CONSTRAINT "fuelings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
