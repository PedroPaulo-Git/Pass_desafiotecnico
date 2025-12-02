import type { SubmitHandler } from "react-hook-form";

interface MakePreSubmitParams<T> {
  isCreating: boolean;
  getValues: () => T;
  setError: (name: string, error: any) => void;
  t: any;
  toast: any;
  handleSubmit: (onValid: SubmitHandler<T>) => (e?: any) => Promise<void>;
  onSubmit: SubmitHandler<T>;
}

export function makePreSubmitHandler<T>({
  isCreating,
  getValues,
  setError,
  t,
  toast,
  handleSubmit,
  onSubmit,
}: MakePreSubmitParams<T>) {
  return async (e: any) => {
    e.preventDefault();
    const values = getValues();

    if (isCreating) {
      let hasErrors = false;
      const plateClean = (values as any).plate ?? "";
      const plateCleanStr = plateClean.toString().replace(/-/g, "").trim();
      if (!plateCleanStr) {
        setError("plate", {
          type: "required",
          message: t.vehicles.validation.plateRequired,
        });
        hasErrors = true;
      }
      if (!((values as any).state) || String((values as any).state).trim().length === 0) {
        setError("state", {
          type: "required",
          message: t.vehicles.validation.stateRequired,
        });
        hasErrors = true;
      }
      const ren = ((values as any).renavam ?? "").toString().replace(/\D/g, "");
      if (!ren || ren.length !== 11) {
        setError("renavam", {
          type: "required",
          message: t.vehicles.validation.renavamLength,
        });
        hasErrors = true;
      }
      const ch = ((values as any).chassis ?? "").toString().toUpperCase();
      if (!ch || ch.length !== 17) {
        setError("chassis", {
          type: "required",
          message: t.vehicles.validation.chassisLength,
        });
        hasErrors = true;
      }
      if (!((values as any).brand) || String((values as any).brand).trim().length === 0) {
        setError("brand", {
          type: "required",
          message: t.vehicles.validation.brandRequired,
        });
        hasErrors = true;
      }
      if (!((values as any).model) || String((values as any).model).trim().length === 0) {
        setError("model", {
          type: "required",
          message: t.vehicles.validation.modelRequired,
        });
        hasErrors = true;
      }
      if (!((values as any).internalId) || String((values as any).internalId).trim().length === 0) {
        setError("internalId", {
          type: "required",
          message: t.vehicles.validation.internalIdRequired,
        });
        hasErrors = true;
      }
      if (!((values as any).description) || String((values as any).description).trim().length === 0) {
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

    // run react-hook-form validation and then submit
    await handleSubmit(onSubmit)(e as any);
  };
}

export default makePreSubmitHandler;
