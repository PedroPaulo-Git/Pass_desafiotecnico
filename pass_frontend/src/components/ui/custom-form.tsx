// components/ui/custom-form.tsx
"use client";

import { FormEvent, ReactNode } from "react";

interface CustomFormProps {
  children: ReactNode;
  onSubmit?: (e: FormEvent) => void;
  className?: string;
}

export function CustomForm({ children, onSubmit, className }: CustomFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Para o evento imediatamente
    e.nativeEvent.stopImmediatePropagation();
    
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      // Adiciona estes eventos para capturar TODO tipo de submit
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      // Previne qualquer comportamento padrão
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' && target.getAttribute('type') === 'submit') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {children}
    </form>
  );
}