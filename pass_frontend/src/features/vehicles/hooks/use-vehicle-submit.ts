import { CreateVehicleInput } from "@pass/schemas/vehicleSchema";
import type { Vehicle } from "@/types/vehicle";

interface UseVehicleSubmitParams {
  isCreating: boolean;
  vehicle?: Vehicle;
  updateVehicle: any;
  createVehicle: any;
  closeModal: () => void;
  t: any;
  toast: any;
  setError: (name: string, error: any) => void;
}

export function useVehicleSubmit({
  isCreating,
  vehicle,
  updateVehicle,
  createVehicle,
  closeModal,
  t,
  toast,
  setError,
}: UseVehicleSubmitParams) {
  return async (formData: CreateVehicleInput) => {
    // client-side gate: ensure required fields on create are present
    if (isCreating) {
      let hasErrors = false;

      // internalId is required on create
      if (
        !formData.internalId ||
        String(formData.internalId).trim().length === 0
      ) {
        setError("internalId", {
          type: "required",
          message: t.vehicles.validation.internalIdRequired,
        });
        hasErrors = true;
      }

      const plateClean = (formData.plate ?? "")
        .toString()
        .replace(/-/g, "")
        .trim();
      if (!plateClean) {
        setError("plate", {
          type: "required",
          message: t.vehicles.validation.plateRequired,
        });
        hasErrors = true;
      }

      if (!formData.state || String(formData.state).trim().length === 0) {
        setError("state", {
          type: "required",
          message: t.vehicles.validation.stateRequired,
        });
        hasErrors = true;
      }

      const ren = (formData.renavam ?? "").toString().replace(/\D/g, "");
      if (!ren || ren.length !== 11) {
        setError("renavam", {
          type: "required",
          message: t.vehicles.validation.renavamLength,
        });
        hasErrors = true;
      }

      const ch = (formData.chassis ?? "").toString().toUpperCase();
      if (!ch || ch.length !== 17) {
        setError("chassis", {
          type: "required",
          message: t.vehicles.validation.chassisLength,
        });
        hasErrors = true;
      }

      if (!formData.brand || String(formData.brand).trim().length === 0) {
        setError("brand", {
          type: "required",
          message: t.vehicles.validation.brandRequired,
        });
        hasErrors = true;
      }

      if (
        !formData.description ||
        String(formData.description).trim().length === 0
      ) {
        setError("description", {
          type: "required",
          message: t.vehicles.validation.descriptionRequired,
        });
        hasErrors = true;
      }

      if (hasErrors) {
        toast.error(t.vehicles.messages.checkRequiredFields);
        return;
      }
    }

    try {
      // sanitize fields before sending
      const payload = {
        ...formData,
        plate: (formData.plate ?? "").toString().replace(/-/g, ""),
        renavam: (formData.renavam ?? "").toString().replace(/\D/g, ""),
        chassis: (formData.chassis ?? "").toString().toUpperCase(),
        state: (formData.state ?? "").toString().toUpperCase(),
        brand: (formData.brand ?? "").toString().trim(),
        description: (formData.description ?? "").toString().trim(),
      } as CreateVehicleInput;

      if (vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, ...payload });
        toast.success(t.vehicles.messages.updatedSuccess);
        closeModal();
        return;
      }
      await createVehicle.mutateAsync(payload);
      toast.success(t.vehicles.messages.createdSuccess);
      closeModal();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? t.vehicles.messages.saveError;
      toast.error(String(message));
    }
  };
}

export default useVehicleSubmit;
