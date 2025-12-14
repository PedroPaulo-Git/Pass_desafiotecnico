import {
  FuelingIdParam,
  UpdateFuelingInput,
} from "@pass/schemas/fuelingSchema";
import { AppError } from "@/utils/AppError";
import { prisma } from "@/lib/prisma";

export const updateFuelingService = async (
  fuelingId: FuelingIdParam,
  fuelingData: UpdateFuelingInput
) => {
  console.log("updateFuelingService - Entry with fuelingId:", fuelingId, "fuelingData:", fuelingData);
  const fueling = await prisma.fueling.findUnique({
    where: {
      id: fuelingId.id,
    },
  });
  if (!fueling) {
    throw new AppError("Fueling not found", 404, "FUELING_NOT_FOUND", {
      fuelingId,
    });
  }
  console.log("updateFuelingService - Found fueling:", fueling);
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: fueling.vehicleId,
    },
  });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND", {});
  }

  //check if fuel type matches
  if (
    fuelingData.fuelType !== undefined &&
    vehicle.fuelType !== fuelingData.fuelType
  ) {
    throw new AppError(
      `Fuel type mismatch: Vehicle fuel type is ${vehicle.fuelType}, but fueling fuel type is ${fuelingData.fuelType}`,
      400,
      "FUEL_TYPE_MISMATCH",
      {
        vehicleFuelType: vehicle.fuelType,
        fuelingFuelType: fuelingData.fuelType,
      }
    );
  }
  //validate odometer is not less than previous reading
  if (
    fuelingData.odometer !== undefined &&
    fuelingData.odometer < fueling.odometer
  ) {
    throw new AppError(
      "Odometer reading cannot be less than the previous reading",
      400,
      "INVALID_ODOMETER_READING",
      { previousOdometer: fueling.odometer, newOdometer: fuelingData.odometer }
    );
  }

  //validate date is not in the future
  if (fuelingData.date !== undefined && fuelingData.date > new Date()) {
    throw new AppError("Date cannot be in the future", 400, "INVALID_DATE", {
      date: fuelingData.date,
    });
  }
  //validate date is not before 1886
  if (
    fuelingData.date !== undefined &&
    fuelingData.date < new Date("1886-01-01")
  ) {
    throw new AppError(
      "Date must be after January 1, 1886",
      400,
      "INVALID_DATE",
      { date: fuelingData.date }
    );
  }
  // Recalculate total fuel cost only if totalValue is not explicitly provided and liters or unit price are updated
  if (fuelingData.totalValue === undefined && (fuelingData.liters !== undefined || fuelingData.unitPrice !== undefined)) {
    fuelingData.totalValue =
      (fuelingData.liters ?? fueling.liters) *
      (fuelingData.unitPrice ?? fueling.unitPrice);
  }
  console.log("updateFuelingService - After recalculation, fuelingData:", fuelingData);

  const result = await prisma.$transaction(async (tx) => {
    const updatedFueling = await tx.fueling.update({
      where: { id: fuelingId.id },
      data: { ...fuelingData },
    });
    if (
      fuelingData.odometer !== undefined &&
      fuelingData.odometer > vehicle.currentKm
    ) {
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { currentKm: fuelingData.odometer },
      });
    }
    return updatedFueling;
  });

  console.log("updateFuelingService - Final result:", result);

  return result;
};
