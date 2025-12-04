import type { CreateVehicleInput } from "@pass/schemas";
import type { Vehicle } from "@/types/vehicle";
import type { UseFormSetError, Path } from "react-hook-form";

/**
 * Minimal toast shape used by hooks in this module.
 * We accept only the methods we actually call to keep typing strict.
 */
type Toast = {
  success: (message: string) => void;
  error: (
    message: string,
    opts?: { description?: string; duration?: number }
  ) => void;
};

/**
 * Types for the mutation hooks returned by `use-vehicles`.
 * We import types via `import()` and `ReturnType` to avoid circular runtime imports.
 */
type CreateVehicleHook = ReturnType<
  typeof import("./use-vehicles").useCreateVehicle
>;
type UpdateVehicleHook = ReturnType<
  typeof import("./use-vehicles").useUpdateVehicle
>;

interface UseVehicleSubmitParams {
  isCreating: boolean;
  vehicle?: Vehicle;
  updateVehicle: UpdateVehicleHook;
  createVehicle: CreateVehicleHook;
  closeModal: () => void;
  // minimal translation shape used by this logic
  t: {
    vehicles: {
      validation: Record<string, string>;
      messages: Record<string, string>;
    };
    common: Record<string, string>;
  };
  toast: Toast;
  setError: UseFormSetError<CreateVehicleInput>;
}

/**
 * useVehicleSubmit: returns a submit handler used by vehicle form.
 * - performs light client-side checks on required fields when creating
 * - sanitizes fields (plate, renavam, chassis, state)
 * - calls create or update mutation and shows localized toasts
 * - maps structured API `issues` into form errors when present
 */
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
    // --- Client-side pre-checks for create mode ---
    if (isCreating) {
      let hasErrors = false;

      const mark = (field: Path<CreateVehicleInput>, message: string) => {
        setError(field, { type: "required", message });
        hasErrors = true;
      };

      if (
        !formData.internalId ||
        String(formData.internalId).trim().length === 0
      ) {
        mark("internalId", t.vehicles.validation.internalIdRequired);
      }

      const plateClean = (formData.plate ?? "")
        .toString()
        .replace(/-/g, "")
        .trim();
      if (!plateClean) mark("plate", t.vehicles.validation.plateRequired);

      if (!formData.state || String(formData.state).trim().length === 0) {
        mark("state", t.vehicles.validation.stateRequired);
      }

      const ren = (formData.renavam ?? "").toString().replace(/\D/g, "");
      if (!ren || ren.length !== 11)
        mark("renavam", t.vehicles.validation.renavamLength);

      const ch = (formData.chassis ?? "").toString().toUpperCase();
      if (!ch || ch.length !== 17)
        mark("chassis", t.vehicles.validation.chassisLength);

      if (!formData.brand || String(formData.brand).trim().length === 0) {
        mark("brand", t.vehicles.validation.brandRequired);
      }

      if (
        !formData.description ||
        String(formData.description).trim().length === 0
      ) {
        mark("description", t.vehicles.validation.descriptionRequired);
      }

      if (hasErrors) {
        toast.error(t.vehicles.messages.checkRequiredFields);
        return;
      }
    }

    // --- Prepare payload and call API ---
    try {
      const payload: CreateVehicleInput = {
        ...formData,
        plate: (formData.plate ?? "").toString().replace(/-/g, ""),
        renavam: (formData.renavam ?? "").toString().replace(/\D/g, ""),
        chassis: (formData.chassis ?? "").toString().toUpperCase(),
        state: (formData.state ?? "").toString().toUpperCase(),
        brand: (formData.brand ?? "").toString().trim(),
        description: (formData.description ?? "").toString().trim(),
      };

      if (vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, ...payload });
        toast.success(t.vehicles.messages.updatedSuccess);
        closeModal();
        return;
      }

      await createVehicle.mutateAsync(payload);
      toast.success(t.vehicles.messages.createdSuccess);
      closeModal();
    } catch (err) {
      // err is unknown (could be AxiosError), try to read common shapes safely
      const apiError = (err as any)?.response?.data ?? (err as any);

      const title =
        apiError?.message || apiError?.error || t.vehicles.messages.saveError;

      // If server returned an `issues` object with field-level messages, map them
      if (
        apiError &&
        typeof apiError === "object" &&
        apiError.issues &&
        typeof apiError.issues === "object"
      ) {
        const issues = apiError.issues as Record<string, unknown>;

        Object.entries(issues).forEach(([field, value]) => {
          if (field === "general") return;
          const message = Array.isArray(value)
            ? String((value as unknown[])[0] ?? "")
            : String(value ?? "");
          if (message)
            setError(field as Path<CreateVehicleInput>, {
              type: "server",
              message,
            });
        });

        const description = issues.general
          ? String(issues.general)
          : Object.values(issues)
              .map((v) =>
                Array.isArray(v)
                  ? String((v as unknown[])[0] ?? "")
                  : String(v ?? "")
              )
              .filter(Boolean)
              .slice(0, 3)
              .join("; ");

        toast.error(title, {
          description: description || undefined,
          duration: 5000,
        });
        return;
      }

      // Field conflict fallback
      if (apiError && typeof apiError === "object" && apiError.details) {
        const { field, value } = (apiError.details as any) || {};
        if (field) {
          setError(field as Path<CreateVehicleInput>, {
            type: "manual",
            message: String(title),
          });
          toast.error(String(title), {
            description: `Conflict on field: ${field} ${
              value ? `(${value})` : ""
            }`,
            duration: 5000,
          });
          return;
        }
      }

      // Generic fallback
      const fallbackMessage =
        (apiError && (apiError.message || apiError.error)) ||
        (err as Error).message ||
        title;
      toast.error(String(fallbackMessage), { duration: 5000 });
    }
  };
}

export default useVehicleSubmit;
