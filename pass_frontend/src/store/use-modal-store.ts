// Zustand Store - Controle de Modals/Sheets
import { create } from "zustand";
import type {
  Vehicle,
  Fueling,
  Incident,
  VehicleDocument,
} from "@/types/vehicle";

type ModalType =
  | "vehicle-details"
  | "vehicle-create"
  | "fueling-create"
  | "incident-create"
  | "document-create"
  | "confirm-delete";

interface ModalData {
  vehicle?: Vehicle;
  fueling?: Fueling;
  incident?: Incident;
  document?: VehicleDocument;
  vehicleId?: string;
  onConfirm?: () => void;
  title?: string;
  description?: string;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  openModal: (type, data = {}) => set({ type, data, isOpen: true }),
  closeModal: () => set({ type: null, data: {}, isOpen: false }),
}));
