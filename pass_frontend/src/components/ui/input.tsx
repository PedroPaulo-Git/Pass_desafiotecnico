import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, variant = 'default', ...props }: React.ComponentProps<'input'> & { variant?: 'default' | 'search' }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 border-0 border-b-2 bg-transparent text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-b-ring ',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
         variant === 'search' && 'border-none ',
          className,
      )}
      {...props}
    />
  )
}

export { Input }
