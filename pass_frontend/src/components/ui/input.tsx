import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  variant = "default",
  center = false,
  value,
  onChange,
  step = 1,
  min,
  max,
  ...props
}: React.ComponentProps<"input"> & {
  variant?: "default" | "light" | "modal" | "custom" | "number";
  center?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Converter o valor para string para o input
  const stringValue = value !== undefined && value !== null ? String(value) : "0";

  const handleIncrement = () => {
    if (!inputRef.current) return;
    const currentValue = Number(inputRef.current.value) || 0;
    const newValue = currentValue + Number(step);
    
    // Validar limites
    if (max !== undefined && newValue > Number(max)) return;
    
    // Simular onChange
    const event = {
      target: { value: String(newValue) }
    } as React.ChangeEvent<HTMLInputElement>;
    if (onChange) onChange(event);
    // Também atualizar o input
    inputRef.current.value = String(newValue);
  };

  const handleDecrement = () => {
    if (!inputRef.current) return;
    const currentValue = Number(inputRef.current.value) || 0;
    const newValue = currentValue - Number(step);
    
    // Validar limites
    if (min !== undefined && newValue < Number(min)) return;
    
    // Simular onChange
    const event = {
      target: { value: String(newValue) }
    } as React.ChangeEvent<HTMLInputElement>;
    if (onChange) onChange(event);
    // Também atualizar o input
    inputRef.current.value = String(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Se o valor for vazio, definir como 0
    if (e.target.value === "") {
      if (onChange) {
        const event = {
          target: { value: "0" }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    } else {
      if (onChange) {
        onChange(e);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Se o valor for vazio após blur, definir como 0
    if (e.target.value === "") {
      if (onChange) {
        const event = {
          target: { value: "0" }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    }
  };

  if (variant === "number") {
    const { defaultValue, ...inputProps } = props;
    return (
      <div className="group relative flex items-center">
        <input
          ref={inputRef}
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:text-muted-foreground h-9 w-full min-w-0 rounded-md border border-border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:ring-0 focus-visible:outline-none focus-visible:border-border",
            "pr-8 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          {...(value !== undefined ? { value: stringValue } : {})}
          {...(defaultValue !== undefined ? { defaultValue } : {})}
          onChange={handleChange}
          onBlur={handleBlur}
          step={step}
          min={min}
          max={max}
          {...inputProps}
        />
        <div className="absolute right-0 flex h-[calc(100%+2px)] -mr-px flex-col opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            tabIndex={-1}
            onClick={handleIncrement}
            className="flex h-1/2 w-6 flex-1 items-center justify-center border border-input text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-tr-md"
            aria-label="Aumentar valor"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={handleDecrement}
            className="-mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-br-md"
            aria-label="Diminuir valor"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }


  const { defaultValue, ...inputProps } = props;
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:text-muted-foreground border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:none focus-visible:ring-0 outline-none focus-visible:border-background",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",

        variant === "light" && [
          "border-b-2 dark:bg-[#ffffff26]/30 border-border border px-0 py-2",
        ],
        variant === "modal" && [
          "text-foreground rounded-md focus-visible:none focus-visible:border-border border",
        ],
        variant === "custom" && [
          "p-0 py-0 px-0 focus-visible:none focus-visible:ring-0 outline-none focus-visible:border-background",
        ],

        className
      )}
      {...inputProps}
    />
  );
}

export { Input };