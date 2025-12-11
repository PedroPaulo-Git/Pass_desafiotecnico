"use client";

import { FuelingCalendar } from "./fueling-calendar";
import type { Fueling } from "@/types/vehicle";

interface FuelingsSectionProps {
  vehicleId: string;
  fuelings: Fueling[];
}

export function FuelingsSection({ vehicleId, fuelings }: FuelingsSectionProps) {
  return <FuelingCalendar vehicleId={vehicleId} fuelings={fuelings} />;
}
