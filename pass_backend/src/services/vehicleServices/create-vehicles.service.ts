import { prisma } from '../../lib/prisma'
import { VehicleType } from '@/type/vehicleType'


export const createVehicleService = async (vehicleData: VehicleType) => {

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