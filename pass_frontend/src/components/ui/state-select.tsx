"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/i18n-context";

interface StateSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const brazilianStateCodes = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function StateSelect({ value, onValueChange, placeholder, disabled }: StateSelectProps) {
  const { t } = useI18n();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="h-8">
        <SelectValue placeholder={t.vehicles.searchState} />
      </SelectTrigger>
      <SelectContent showSearch={true} bg_fill={true}>
        {brazilianStateCodes.map((code) => (
          <SelectItem key={code} value={code}>
            {code} - {t.vehicles.states[code as keyof typeof t.vehicles.states]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}