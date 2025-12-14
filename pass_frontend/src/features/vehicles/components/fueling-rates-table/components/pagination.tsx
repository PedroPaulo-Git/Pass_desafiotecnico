"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  selectedCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

export function Pagination({
  selectedCount,
  totalCount,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  return (
    <div className="sm:flex sm:flex-row gap-4 flex flex-col items-center justify-between px-5 py-4 border-t border-border">
      {/* Lado Esquerdo: Texto de Seleção */}
      <div className="text-sm text-muted-foreground">
        {selectedCount} de {totalCount} linha(s)
        selecionada(s).
      </div>

      {/* Dropdown: Linhas por página */}
      <div className="flex items-center space-x-2 h-8 bg-background ">
        <Select
          value={`${itemsPerPage}`} // Converte para string pois o Select espera string
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[110px]" variant="pagination">
            {/* Mostrar o texto formatado (ex.: "10 / page") */}
            <SelectValue>{`${itemsPerPage} / page`}</SelectValue>
          </SelectTrigger>
          {/* side é aceito; removeu-se o prop 'variant' que causava erro de tipo */}
          <SelectContent side="top">
            {[5, 10, 15, 20, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Lado Direito: Controles */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Texto: Página X de Y */}
        <div className="flex w-[70px] items-center justify-center text-sm font-medium text-nowrap">
          Página {currentPage} de {totalPages}
        </div>

        {/* Botões de Navegação (Primeira, Anterior, Próxima, Última) */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className=" h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
