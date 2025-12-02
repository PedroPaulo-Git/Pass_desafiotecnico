import type { SubmitHandler, UseFormSetError, Path, FieldValues } from "react-hook-form";
import type React from "react";

/**
 * makePreSubmitHandler
 * --------------------
 * Utility that runs light, synchronous pre-submit checks when creating a vehicle
 * and then runs react-hook-form's `handleSubmit` to perform form validation
 * and call the provided `onSubmit` handler.
 *
 * - T is the form values type used by react-hook-form
 * - setError is strongly typed via UseFormSetError<T>
 * - The function returns an event handler suitable for a form `onSubmit`
 */
interface MakePreSubmitParams<T extends FieldValues> {
  isCreating: boolean;
  getValues: () => T;
  setError: UseFormSetError<T>;
  // minimal translation shape used by this helper
  t: {
    vehicles: {
      validation: Record<string, string>;
      messages: Record<string, string>;
    };
  };
  // minimal toast shape
  toast: {
    error: (message: string) => void;
  };
  handleSubmit: (onValid: SubmitHandler<T>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  onSubmit: SubmitHandler<T>;
}

export function makePreSubmitHandler<T extends FieldValues>({
  isCreating,
  getValues,
  setError,
  t,
  toast,
  handleSubmit,
  onSubmit,
}: MakePreSubmitParams<T>) {
  return async (e?: React.BaseSyntheticEvent) => {
    // prevent default form submit behaviour when an event is supplied
    e?.preventDefault();

    const values = getValues();
    const v = values as Record<string, unknown>;

    if (isCreating) {
      let hasErrors = false;

      const setFieldError = (field: string, message: string) => {
        // cast to Path<T> to satisfy UseFormSetError typing (field names are runtime strings)
        setError(field as Path<T>, { type: "required", message });
        hasErrors = true;
      };

      const plateClean = String(v["plate"] ?? "").replace(/-/g, "").trim();
      if (!plateClean) setFieldError("plate", t.vehicles.validation.plateRequired);

      const stateVal = String(v["state"] ?? "").trim();
      if (!stateVal) setFieldError("state", t.vehicles.validation.stateRequired);

      const ren = String(v["renavam"] ?? "").replace(/\D/g, "");
      if (!ren || ren.length !== 11) setFieldError("renavam", t.vehicles.validation.renavamLength);

      const chassis = String(v["chassis"] ?? "").toUpperCase();
      if (!chassis || chassis.length !== 17) setFieldError("chassis", t.vehicles.validation.chassisLength);

      const brand = String(v["brand"] ?? "").trim();
      if (!brand) setFieldError("brand", t.vehicles.validation.brandRequired);

      const model = String(v["model"] ?? "").trim();
      if (!model) setFieldError("model", t.vehicles.validation.modelRequired || "Required");

      const internalId = String(v["internalId"] ?? "").trim();
      if (!internalId) setFieldError("internalId", t.vehicles.validation.internalIdRequired);

      const description = String(v["description"] ?? "").trim();
      if (!description) setFieldError("description", t.vehicles.validation.descriptionRequired);

      if (hasErrors) {
        toast.error(t.vehicles.messages.checkRequiredFields);
        return;
      }
    }

    // Delegate to react-hook-form's handler which runs schema/field validation
    await handleSubmit(onSubmit)(e);
  };
}

export default makePreSubmitHandler;
