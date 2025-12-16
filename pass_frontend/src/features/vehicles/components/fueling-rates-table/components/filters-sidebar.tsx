"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-context";

interface FiltersSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FiltersSidebar({ open, onOpenChange }: FiltersSidebarProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  return (
    <div
      className={cn(
        "absolute top-0 left-0 h-full bg-background transition-all duration-300 ease-in-out overflow-hidden z-50",
        open ? "w-[340px] shadow-lg" : "w-0"
      )}
    >
      <div className="flex flex-col h-full w-[340px]  border rounded-tl-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Filtros</h3>
            <p className="text-xs text-muted-foreground">Filtre os resultados</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.common.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-full"
              variant="light"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 transition-all duration-300 ease-in-out">
          <div className="space-y-4">
            {/* Period */}
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Input placeholder="Selecione um intervalo de datas" className="h-9" variant="light" />
            </div>

            {/* Categoria */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <div className="space-y-2">
                <Button variant="outline" className="w-full text-left">ONIBUS</Button>
                <Button variant="outline" className="w-full text-left">VAN</Button>
                <Button variant="outline" className="w-full text-left">CARRO</Button>
              </div>
            </div>

            {/* Pax minimum example */}
            <div>
              <label className="text-sm font-medium mb-2 block">Pax mínimo</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground block">Mín.</label>
                  <Input className="h-9" variant="light" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block">Máx.</label>
                  <Input className="h-9" variant="light" />
                </div>
              </div>
            </div>

            {/* Child/Adult ranges (visual only) */}
            <div>
              <label className="text-sm font-medium mb-2 block">Infantil</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input placeholder="R$0.00" className="h-9" variant="light" />
                <Input placeholder="R$50.00" className="h-9" variant="light" />
              </div>
              <div className="h-2 bg-muted rounded-full" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Adulto</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input placeholder="R$0.00" className="h-9" variant="light" />
                <Input placeholder="R$350.00" className="h-9" variant="light" />
              </div>
              <div className="h-2 bg-muted rounded-full" />
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Limpar
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
