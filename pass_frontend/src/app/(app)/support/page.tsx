"use client";
import React, { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { HelpdeskList } from "@/features/helpdesk/components/HelpdeskList";
import { CreateHelpdeskDialog } from "@/features/helpdesk/components/CreateHelpdeskDialog";
import { BackendStatus } from "@/features/helpdesk/components/BackendStatus";
import { Helpdesk, HelpdeskFilters } from "@/features/helpdesk/types/helpdesk";
import { TicketDialog } from "@/components/support/supportComponents/TicketDialog";
import { TicketData } from "@/components/support/types";
import { Toolbar } from "@/components/support/Toolbar";
import { FilterHeader } from "@/components/support/FilterHeader";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUpdateHelpdesk } from "@/features/helpdesk/hooks/use-helpdesk";
import { useSetPageTitle } from "@/lib/contexts/page-title-context";

// --- Componente Principal da Página ---
export function SupportTicketPage() {
  const { currentUser } = useAuth();
  const updateMutation = useUpdateHelpdesk();
  useSetPageTitle("Suporte");
  const [filters, setFilters] = useState<HelpdeskFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Estados para Toolbar e FilterHeader
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "lanes">("list");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [moduleFilter, setModuleFilter] = useState("todos");

  // Estados temporários para filtros (inicializados com os valores atuais)
  const [tempSearch, setTempSearch] = useState(search);
  const [tempModuleFilter, setTempModuleFilter] = useState(moduleFilter);
  const [hasSearched, setHasSearched] = useState(false);

  // Sincronizar valores temporários quando os valores reais mudam
  React.useEffect(() => {
    setTempSearch(search);
  }, [search]);

  React.useEffect(() => {
    setTempModuleFilter(moduleFilter);
  }, [moduleFilter]);

  const handleSearch = useCallback(() => {
    // Aplicar todos os filtros de uma vez
    console.log("Aplicando filtros:", { tempSearch, tempModuleFilter });
    setSearch(tempSearch);
    setModuleFilter(tempModuleFilter);
    setHasSearched(true);
    console.log("Filtros aplicados com sucesso");
  }, [tempSearch, tempModuleFilter]);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 })); // Reset to page 1 when changing limit
  }, []);

  const memoizedFilters = React.useMemo(() => {
    const statusMap: Record<string, any> = {
      Todos: undefined,
      Abertos: "ABERTO",
      "Em Análise": "EM_ANALISE",
      "Em Andamento": "EM_ANDAMENTO",
      "Aguardando Usuário": "AGUARDANDO_USUARIO",
      Resolvidos: "RESOLVIDO",
      Fechados: "ENCERRADO",
    };

    const result: HelpdeskFilters = {
      ...filters,
      status: statusMap[statusFilter as string],
      module: moduleFilter !== "todos" ? (moduleFilter as any) : undefined,
      search,
    };

    console.log("Memoized filters updated:", result);
    return result;
  }, [
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
    statusFilter,
    moduleFilter,
    search,
  ]);

  // Mock status counts (deve vir do backend depois)
  const statusCounts = {
    total: 7,
    abertos: 5,
    emAnalise: 0,
    andamento: 1,
    aguardandoUsuario: 0,
    resolvidos: 1,
    fechados: 0,
  };

  const modules = ["Financeiro", "Admin", "Checkout", "Integração", "Frontend"];

  const handleClearFilters = useCallback(() => {
    console.log("Limpando todos os filtros");
    setStatusFilter("todos");
    setSearch("");
    setTempSearch("");
    setDateRange(undefined);
    setModuleFilter("todos");
    setTempModuleFilter("todos");
    setHasSearched(false);
  }, []);

  const hasActiveFilters = Boolean(
    statusFilter !== "todos" || search || dateRange || moduleFilter !== "todos"
  );

  // Dialog states
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateSuccess = useCallback((newTicket: Helpdesk) => {
    // Optionally navigate to the new ticket or refresh the list
    console.log("New ticket created:", newTicket);
  }, []);

  const handleTicketClick = useCallback((ticket: TicketData) => {
    console.log("🎫 Ticket clicked:", ticket);
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  }, []);

  const handleUpdateStatus = useCallback(
    (id: string, status: any) => {
      updateMutation.mutate({ id, updates: { status } });
    },
    [updateMutation]
  );

  const handleUpdatePriority = useCallback(
    (id: string, priority: any) => {
      updateMutation.mutate({ id, updates: { priority } });
    },
    [updateMutation]
  );

  const handleUpdateAssignedUser = useCallback(
    (id: string, assignedUserId: string) => {
      updateMutation.mutate({ id, updates: { assignedUserId } });
    },
    [updateMutation]
  );

  const handleUpdateTitle = useCallback(
    (id: string, title: string) => {
      updateMutation.mutate({ id, updates: { title } });
    },
    [updateMutation]
  );

  const handleUpdateDescription = useCallback(
    (id: string, description: string) => {
      updateMutation.mutate({ id, updates: { description } });
    },
    [updateMutation]
  );

  const handleUpdateCategory = useCallback(
    (id: string, category: any) => {
      updateMutation.mutate({ id, updates: { category } });
    },
    [updateMutation]
  );

  const handleUpdateModule = useCallback(
    (id: string, module: any) => {
      updateMutation.mutate({ id, updates: { module } });
    },
    [updateMutation]
  );

  const handleUpdateEnvironment = useCallback(
    (id: string, environment: any) => {
      updateMutation.mutate({ id, updates: { environment } });
    },
    [updateMutation]
  );

  return (
    <div className="text-foreground overflow-y-hidden">
      <div className="mx-auto lg:max-w-[90vw] max-w-full p-6 overflow-y-auto ">
        <div className="flex justify-end my-4"></div>
        <div className="flex w-full mb-4 flex-row sm:flex-col items-center justify-center px-2 py-4 gap-4 relative border border-border/20 rounded-xl bg-background/40 backdrop-blur-sm shadow-lg shadow-black/20 ring-1 ring-black/5 z-20">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[99%]"></div>
          <div className="flex flex-wrap items-stretch gap-2 w-full sm:w-auto">
            <FilterHeader
              search={search}
              setSearch={setSearch}
              dateRange={dateRange}
              setDateRange={setDateRange}
              modules={modules}
              moduleFilter={moduleFilter}
              setModuleFilter={setModuleFilter}
              onClearFilters={handleClearFilters}
              onClickNewTicket={() => setIsCreateDialogOpen(true)}
              onSearch={handleSearch}
              tempSearch={tempSearch}
              setTempSearch={setTempSearch}
              tempModuleFilter={tempModuleFilter}
              setTempModuleFilter={setTempModuleFilter}
            />
          </div>
          <Toolbar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusCounts={statusCounts}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
        <div className="">
          <HelpdeskList
            hasSearched={hasSearched}
            filters={memoizedFilters}
            onCreateClick={() => setIsCreateDialogOpen(true)}
            onTicketClick={handleTicketClick}
            viewMode={viewMode}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        <TicketDialog
          ticket={selectedTicket}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePriority={handleUpdatePriority}
          onUpdateAssignedUser={handleUpdateAssignedUser}
          onUpdateTitle={handleUpdateTitle}
          onUpdateDescription={handleUpdateDescription}
          onUpdateCategory={handleUpdateCategory}
          onUpdateModule={handleUpdateModule}
          onUpdateEnvironment={handleUpdateEnvironment}
        />

        <CreateHelpdeskDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleCreateSuccess}
        />
      </div>
    </div>
  );
}

export default SupportTicketPage;
