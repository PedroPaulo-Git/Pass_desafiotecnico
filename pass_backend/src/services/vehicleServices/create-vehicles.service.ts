import { prisma } from '../../lib/prisma'
import { CreateVehicleInput } from '@/schemas/vehicleSchema';


export const createVehicleService = async (vehicleData: CreateVehicleInput) => {

    const existingVehicle = await prisma.vehicle.findUnique({
        where:{
            plate:vehicleData.plate
        }
    });
    if(existingVehicle){
        throw new Error('Veiculo com essa placa já existe.');
    }

    const newVehicle = await prisma.vehicle.create({
        data: vehicleData
    });
    return newVehicle;
}