'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
interface TableCellProps extends React.ComponentProps<'td'> {
  variant?: 'default' | 'compact'
}

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn('w-full min-w-full caption-bottom text-xs md:text-sm', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, variant = 'default', center = false, ...props }: React.ComponentProps<'th'> & { variant?: 'default' | 'compact', center?: boolean }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 px-2 xl:px-0 xl:p-5 text-left align-middle first:pl-5 font-bold whitespace-normal wrap-break-word sm:first:pl-5 [&:has([role=checkbox])]:pr-0',
        variant === 'compact' && 'py-2 px-2 xl:px-0 xl:p-2 xl:py-5 sm:first:pl-8 ',
        center && 'text-center',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, variant = 'default', center = false, ...props }: TableCellProps & { center?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // Estilos Base (Sempre aplicados)
        'align-middle whitespace-normal wrap-break-word first:pl-5 sm:first:pl-8 [&:has([role=checkbox])]:pr-0',
        
        // Variante Default (O estilo original que você tinha)
        variant === 'default' && 'py-2 px-2 xl:px-0 xl:p-5',

        // Variante Compact (Com o xl:p-2 que você pediu)
        variant === 'compact' && 'py-2 px-2 xl:px-0 xl:p-2',
        center && 'text-center',

        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
