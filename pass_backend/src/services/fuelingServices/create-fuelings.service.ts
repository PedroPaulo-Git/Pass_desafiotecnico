import { prisma } from "@/lib/prisma";
import { CreateFuelingInput } from "@pass/schemas/fuelingSchema";
import { AppError } from "@/utils/AppError";

export const createFuelingService = async (
  vehicleId: string,
  fuelingData: CreateFuelingInput
) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND", {});
  }

  //check if fuel type matches
  if (vehicle.fuelType !== fuelingData.fuelType) {
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
  if (fuelingData.odometer < vehicle.currentKm) {
    throw new AppError(
      "Odometer reading cannot be less than the previous reading",
      400,
      "INVALID_ODOMETER_READING",
      { previousOdometer: vehicle.currentKm, newOdometer: fuelingData.odometer }
    );
  }
  //validate date is not in the future
  if (fuelingData.date !== undefined && fuelingData.date > new Date()) {
    throw new AppError("Date cannot be in the future", 400, "INVALID_DATE", {
      date: fuelingData.date,
    });
  }
  //validate date is not before 1886
  if (fuelingData.date < new Date("1886-01-01")) {
    throw new AppError(
      "Date must be after January 1, 1886",
      400,
      "INVALID_DATE",
      { date: fuelingData.date }
    );
  }

  // Prefer explicit totalValue sent by client. If not provided, fall back to liters * unitPrice for backward compatibility.
  const totalValue =
    fuelingData.totalValue !== undefined && fuelingData.totalValue !== null
      ? fuelingData.totalValue
      : (fuelingData.liters || 0) * (fuelingData.unitPrice || 0);

  const result = await prisma.$transaction(async (tx) => {
    const newFueling = await tx.fueling.create({
      data: {
        ...fuelingData,
        totalValue,
        vehicleId: vehicle.id,
      },
    });
    //update vehicle currentKm if odometer is greater
    if (fuelingData.odometer > vehicle.currentKm) {
      await tx.vehicle.update({
        where: {
          id: vehicle.id,
        },
        data: {
          currentKm: fuelingData.odometer,
        },
      });
    }
    return newFueling;
  });
  return result;
};
