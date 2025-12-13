"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, AlertCircle, ChevronDown } from "lucide-react";

import { Sparkles, RefreshCw, CloudDownload, RotateCw } from "lucide-react";

import {InlineFuelingForm} from "@/features/fleet-events/components/Fueling/FuelingModal";
import IncidentModal from "@/features/fleet-events/components/Incident/IncidentModal";
import DocumentModal from "@/features/fleet-events/components/Documents/DocumentModal";

import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useActiveNavTitle } from "@/hooks/use-active-nav-title";
import { useVehicles } from "../hooks/use-vehicles";
import { VehiclesTable } from "./vehicles-table";
import { VehiclesFilters } from "./vehicles-filters";
import { VehicleModal } from "./vehicle-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import ButtonBot from "@/components/ui/ButtonBot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { VehicleFilters } from "@/types/vehicle";
import { getMockVehiclesPaginated } from "../data/mock-vehicles";

import { ConfirmDeleteVehicleModal } from "./vehicle-delete-modal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function VehiclesListPage() {
  const { t } = useI18n();
  const { openModal } = useModalStore();

  // Define automaticamente o título da página baseado na rota
  const { currentTitle } = useActiveNavTitle();
  const [showFilters, setShowFilters] = useState(false);
  const [showMockData, setShowMockData] = useState(false);
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuickError, setShowQuickError] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);

  const { data, isLoading, error, refetch } = useVehicles(filters);
  const { type: modalType } = useModalStore();

  const handleSearch = (value: string) => {
    const v = value.trim();
    setSearchTerm(value);

    // normalize for plate detection (remove non-alnum and uppercase)
    const normalized = v.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // plate regexes: old pattern AAA9999 and mercosul-like AAA9A99
    const plateRegexes = [/^[A-Z]{3}\d{4}$/, /^[A-Z]{3}\d[A-Z]\d{2}$/];

    // enums / known filters (uppercased)
    const statuses = ["LIBERADO", "EM_MANUTENCAO", "INDISPONIVEL", "VENDIDO"];
    const categories = ["ONIBUS", "VAN", "CARRO", "CAMINHAO"];
    const classifications = ["PREMIUM", "BASIC", "EXECUTIVO"];

    const upper = v.toUpperCase();

    // base reset (go to first page)
    const base: Partial<VehicleFilters> = { page: 1 };

    // Helper to set exactly one textual filter at a time
    const applySingle = (single: Partial<VehicleFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...base,
        // clear all known text filters first
        plate: undefined,
        brand: undefined,
        status: undefined,
        category: undefined,
        classification: undefined,
        state: undefined,
        ...single,
      }));
    };

    // empty -> clear text filters
    if (!v) {
      applySingle({});
      return;
    }

    // 1) Plate exact match
    if (normalized && plateRegexes.some((r) => r.test(normalized))) {
      applySingle({ plate: normalized });
      return;
    }

    // 2) Exact enum matches (status/category/classification)
    if (statuses.includes(upper)) {
      applySingle({ status: upper as any });
      return;
    }

    if (categories.includes(upper)) {
      applySingle({ category: upper as any });
      return;
    }

    if (classifications.includes(upper)) {
      applySingle({ classification: upper as any });
      return;
    }

    // 3) UF/state code (2 letters)
    if (/^[A-Z]{2}$/.test(upper)) {
      applySingle({ state: upper });
      return;
    }

    // 4) Fallback to brand if the input is mainly alphabetic (brand/model search)
    const looksLikeAlphabet = /^[A-Za-zÀ-ÿ0-9 \-_.]{2,60}$/.test(v);
    if (looksLikeAlphabet) {
      // prefer brand filtering as backend supports it; keep original casing
      applySingle({ brand: v });
      return;
    }

    // 5) Last resort: if nothing matched, send it as brand anyway (safer than relying on unsupported `search` param)
    applySingle({ brand: v });
  };

  const handleFilterChange = (newFilters: Partial<VehicleFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRetryConnection = () => {
    setShowMockData(false);
    setRetryLoading(true);
    setShowQuickError(false);
    refetch().finally(() => setRetryLoading(false));
  };

  const handleToggleMockData = () => {
    setShowMockData(!showMockData);
  };

  // Show the error UI earlier if loading hangs
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isLoading) {
      timer = setTimeout(() => setShowQuickError(true), 1000);
    } else {
      setShowQuickError(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // Determine which data to display
  const displayData = showMockData
    ? getMockVehiclesPaginated(filters.page || 1, filters.limit || 10)
    : data;

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 bg-card border-border border rounded-2xl overflow-hidden"
      >
        {/* Toolbar - Matches reference design exactly */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between  px-5 pt-4"
        >
          {/* Left: Icon button + Search + Filter buttons */}
          <div className="flex items-center gap-2 flex-1 mb-1 z-50 ">
            <ButtonBot />
            <div
              data-orientation="vertical"
              role="none"
              data-slot="separator"
              className="bg-border 
              shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:h-4 mx-0.5"
            ></div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.common.search}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-9 w-52 "
                variant="light"
              />
            </div>

            {/* Mode Filter Button */}
            <Button
              variant="table_border_cutted"
              className="gap-1.5 h-9"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Modo</span>
            </Button>

            {/* Status Filter Button */}
            <Button
              variant="table_border_cutted"
              className="gap-1.5 h-9"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
            </Button>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            {/* Update button */}
            <Button
              variant="outline"
              className="gap-1.5 h-9"
              onClick={() => refetch()}
            >
              <RotateCw className="h-4 w-4" />
              <span className="hidden sm:inline">Update</span>
            </Button>

            {/* Export button with dropdown */}
            <Button variant="outline" className="gap-1.5 h-9">
              <CloudDownload className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {/* Add button - Primary */}
            <Button
              className="gap-1.5 h-9"
              onClick={() => openModal("vehicle-create")}
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar</span>
            </Button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <VehiclesFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={() => {
                  setFilters({
                    page: 1,
                    limit: 10,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  });
                  setSearchTerm("");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <motion.div variants={itemVariants}>
          {isLoading && !showQuickError ? (
            <TableSkeleton rows={10} />
          ) : (error && !showMockData) || (showQuickError && !showMockData) ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <div className="space-y-2">
                    <p className="font-semibold">
                      {t.vehicles.messages.backendError}
                    </p>
                    <p className="text-sm">
                      {t.vehicles.messages.backendHibernating}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleRetryConnection}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${retryLoading ? "animate-spin" : ""}`}
                  />
                  {t.vehicles.messages.retryConnection}
                </Button>
                <Button
                  onClick={handleToggleMockData}
                  variant="default"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {t.vehicles.messages.showTestVehicles}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {showMockData && (
                <div className="mb-4 bg-muted/50  rounded-lg p-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t.vehicles.messages.usingTestData}
                  </p>
                  <Button
                    onClick={handleToggleMockData}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    {t.vehicles.messages.hideTestVehicles}
                  </Button>
                </div>
              )}
              <VehiclesTable
                vehicles={displayData?.items || []}
                pagination={{
                  page: displayData?.page || 1,
                  totalPages: displayData?.totalPages || 1,
                  total: displayData?.total || 0,
                  limit: filters.limit || 10,
                }}
                onPageChange={handlePageChange}
                onPageSizeChange={(newLimit) => {
                  setFilters((prev) => ({
                    ...prev,
                    limit: newLimit,
                    page: 1, // Reset to first page when changing page size
                  }));
                }}
              />
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Modals */}

      <AnimatePresence>
        {(modalType === "vehicle-details" ||
          modalType === "vehicle-create") && (
          <VehicleModal
            key={modalType ?? "vehicle-modal"}
            isCreate={modalType === "vehicle-create"}
          />
        )}
        {modalType === "incident-create" && <IncidentModal />}
        {modalType === "document-create" && <DocumentModal />}
        {modalType === "confirm-delete" && <ConfirmDeleteVehicleModal />}
      </AnimatePresence>
    </>
  );
}
