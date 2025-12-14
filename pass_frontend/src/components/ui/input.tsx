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
  prefix,
  suffix,
  ...props
}: React.ComponentProps<"input"> & {
  variant?: "default" | "light" | "modal" | "custom" | "number";
  center?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const stringValue =
    value !== undefined && value !== null ? String(value) : "0";

  const formatValue = (val: string | number) => {
    const num = val !== undefined && val !== null ? Number(val) : 0;
    const str = num.toFixed(2);
    return (prefix || "") + str + (suffix || "");
  };

  const formattedValue = formatValue(stringValue);
  const [displayValue, setDisplayValue] = React.useState(formattedValue);

  // Atualizar displayValue quando value muda
  React.useEffect(() => {
    setDisplayValue(formattedValue);
  }, [formattedValue]);

  // Para edição, usar defaultValue para definir displayValue inicial
  React.useEffect(() => {
    if (props.defaultValue !== undefined && (prefix || suffix)) {
      setDisplayValue(formatValue(props.defaultValue as string | number));
    }
  }, [props.defaultValue]);

  // Extrair número do valor formatado
  const extractNumber = (formatted: string) => {
    const withoutPrefix = prefix ? formatted.replace(prefix, "") : formatted;
    const withoutSuffix = suffix
      ? withoutPrefix.replace(suffix, "")
      : withoutPrefix;
    return withoutSuffix.replace(/[^\d.-]/g, "") || "0";
  };

  const handleIncrement = () => {
    if (!inputRef.current) return;
    const currentFormatted = inputRef.current.value;
    const currentNumber = Number(extractNumber(currentFormatted)) || 0;
    const newValue = currentNumber + Number(step);

    // Validar limites
    if (max !== undefined && newValue > Number(max)) return;

    const newFormatted = formatValue(newValue);
    setDisplayValue(newFormatted);

    // Simular onChange
    const event = {
      target: { value: String(newValue) },
    } as React.ChangeEvent<HTMLInputElement>;
    if (onChange) onChange(event);
  };

  const handleDecrement = () => {
    if (!inputRef.current) return;
    const currentFormatted = inputRef.current.value;
    const currentNumber = Number(extractNumber(currentFormatted)) || 0;
    const newValue = currentNumber - Number(step);

    // Validar limites
    if (min !== undefined && newValue < Number(min)) return;

    const newFormatted = formatValue(newValue);
    setDisplayValue(newFormatted);

    // Simular onChange
    const event = {
      target: { value: String(newValue) },
    } as React.ChangeEvent<HTMLInputElement>;
    if (onChange) onChange(event);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Para edição, não fazer nada, deixar o usuário digitar
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (inputRef.current) {
      const currentValue = inputRef.current.value;
      const extracted = extractNumber(currentValue);
      const formatted = formatValue(extracted);
      inputRef.current.value = formatted;
      setDisplayValue(formatted);
      if (onChange) {
        const event = {
          target: { value: extracted },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    }
  };

  if (variant === "number") {
    const { defaultValue, ...inputProps } = props;
    const inputType = prefix || suffix ? "text" : type;
    return (
      <div className={cn("group relative flex items-center")}>
        <input
          ref={inputRef}
          type={inputType}
          data-slot="input"
          className={cn(
            "peer px-2 py-1 pr-6 file:text-foreground placeholder:text-muted-foreground selection:text-muted-foreground h-9 w-full min-w-0 rounded-md  bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:ring-0 focus-visible:outline-none focus-visible:border-border",
            "[-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                isHovered ||  inputRef.current === document.activeElement
              ? "border border-border"
              : "",
               
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...(value !== undefined
            ? { value: displayValue }
            : { defaultValue: formattedValue })}
          onChange={handleChange}
          onBlur={handleBlur}
          step={step}
          min={min}
          max={max}
          {...inputProps}
        />
        <div
          className={cn(
            "absolute right-0 flex h-[calc(100%+2px)] -mr-px flex-col transition-opacity",
            isHovered || inputRef.current === document.activeElement
              ? "opacity-100"
              : "opacity-0"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            type="button"
            tabIndex={-1}
            onClick={handleIncrement}
            className="flex h-1/2 w-6 flex-1 items-center justify-center border border-border text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-tr-md"
            aria-label="Aumentar valor"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={handleDecrement}
            className="-mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-border text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-br-md"
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
