// Textarea.tsx

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.ComponentProps<'textarea'> {
  variant?: 'default' | 'underlined'
}

function Textarea({ className, variant = 'default', ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // --- ESTILOS BASE (Comuns a ambos) ---
        'flex field-sizing-content min-h-16 w-full bg-transparent text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        
        // --- VARIANTE PADRÃO (Caixa fechada) ---
        variant === 'default' && [
          'border border-input rounded-md shadow-xs px-3 py-2',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
        ],

        // --- VARIANTE UNDERLINED (Com o detalhe do resize no canto) ---
        variant === 'underlined' && [
          'border-0 border-b border-input rounded-none px-0 py-2 shadow-none', // Mantém o estilo sublinhado
          'focus-visible:ring-0 focus-visible:border-primary', // Foco apenas na linha
          // NÃO ADICIONE 'resize-none' AQUI!
        ],

        className
      )}
      {...props}
    />
  )
}

export { Textarea }