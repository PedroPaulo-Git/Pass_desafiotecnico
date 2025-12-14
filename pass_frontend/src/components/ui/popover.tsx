'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = 'center',
  variant = "calendar",
  sideOffset = 4,
  onInteractOutside,
  onPointerDownOutside,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & { variant?: "calendar" | "default" }) {
  const contentProps: React.ComponentProps<typeof PopoverPrimitive.Content> & { 'data-slot'?: string } = {
    'data-slot': 'popover-content',
    align,
    sideOffset,
    className: cn(
      'bg-background text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
   variant=== "calendar" && "w-auto p-0 py-0 px-0",
      className,
    ),
    ...props,
  };

  if (onInteractOutside) {
    contentProps.onInteractOutside = (e) => {
      const target = e.target as HTMLElement;
      
      // REGRA 1: Se clicou dentro de outro Popover ou Select, NÃO fecha
      if (
        target?.closest('[data-radix-select-content]') || 
        target?.closest('[data-radix-popover-content]') ||
        target?.closest('[role="listbox"]') ||
        target?.closest('[role="dialog"]')
      ) {
        e.preventDefault();
        return;
      }
      
      // REGRA 2: Se tem callback personalizado, chama ele
      onInteractOutside(e);
    };
  }

  if (onPointerDownOutside) {
    contentProps.onPointerDownOutside = (e) => {
      const target = e.target as HTMLElement;
      
      // REGRA 1: Se clicou dentro de outro Popover ou Select, NÃO fecha
      if (
        target?.closest('[data-radix-select-content]') || 
        target?.closest('[data-radix-popover-content]') ||
        target?.closest('[role="listbox"]') ||
        target?.closest('[role="dialog"]')
      ) {
        e.preventDefault();
        return;
      }
      
      // REGRA 2: Se tem callback personalizado, chama ele
      onPointerDownOutside(e);
    };
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content {...contentProps} />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }