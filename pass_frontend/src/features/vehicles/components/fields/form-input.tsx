"use client"
import React, { useState, useEffect, useCallback, memo } from "react";
import { useController } from "react-hook-form";
import { Input } from "@/components/ui/input";

type FormInputProps = {
  name: string;
  control: any;
  rules?: any;
  placeholder?: string;
  formatter?: (v: string) => string;
  debounceMs?: number;
  className?: string;
  inputMode?: any;
  type?: any;
  disabled?: boolean;
  clearErrors?: (name?: string | string[]) => void;
};

export function FormInput({
  name,
  control,
  rules,
  placeholder,
  formatter,
  debounceMs = 180,
  className,
  inputMode,
  type,
  disabled,
  clearErrors,
}: FormInputProps) {
  const { field } = useController({ name, control, rules });

  const [local, setLocal] = useState<string>(field.value ?? "");

  useEffect(() => {
    // keep local in sync if external value changes
    setLocal(field.value ?? "");
  }, [field.value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatter ? formatter(raw) : raw;
      setLocal(formatted);
      // update RHF immediately so validation runs (useForm mode: 'onChange')
      field.onChange(formatted);
      if (clearErrors) clearErrors(name);
    },
    [formatter, field, clearErrors, name]
  );

  const handleBlur = useCallback(() => {
    field.onBlur();
    if (clearErrors) clearErrors(name);
  }, [field, clearErrors, name]);

  return (
    <Input
      value={local}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      inputMode={inputMode}
      type={type}
      disabled={disabled}
    />
  );
}

export default memo(FormInput);
