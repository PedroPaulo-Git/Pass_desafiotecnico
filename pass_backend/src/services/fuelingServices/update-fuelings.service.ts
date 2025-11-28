import { FuelingIdParam, UpdateFuelingInput } from "@/schemas/fuelingSchema";
import { AppError } from "@/utils/AppError";
import { prisma } from "@/lib/prisma";


export const updateFuelingService = async (fuelingId:FuelingIdParam, fuelingData:UpdateFuelingInput) => {
    const findFueling = await prisma.fueling.findUnique({
        where: {
            id: fuelingId.id,
        },
    });
    if (!findFueling) {
        throw new AppError("Fueling not found", 404, "FUELING_NOT_FOUND", {
            fuelingId,
        });
    }
    const updatedFueling = await prisma.fueling.update({
        where: {
            id: fuelingId.id,
        },
        data: {
            ...fuelingData,
        },
    });
    
    return updatedFueling;

}