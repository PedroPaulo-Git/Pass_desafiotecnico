"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Settings2,
  MoreVertical,
  Sparkles,
  Pin,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useVehicles } from "../hooks/use-vehicles";
import { VehiclesTable } from "./vehicles-table";
import { VehiclesFilters } from "./vehicles-filters";
import { VehicleModal } from "./vehicle-modal";
import { FuelingModal } from "./fueling-modal";
import { IncidentModal } from "./incident-modal";
import { DocumentModal } from "./document-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { VehicleFilters } from "@/types/vehicle";

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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useVehicles(filters);
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

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">{t.vehicles.title}</h1>
            <Pin className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">{t.nav.fleet}</span>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-lg border border-border"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.common.search}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
             <Button onClick={() => openModal("vehicle-create")}>{t.vehicles.create}</Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
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
                    limit: 20,
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
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              {t.common.error}: Erro ao carregar veículos
            </div>
          ) : (
            <VehiclesTable
              vehicles={data?.items || []}
              pagination={{
                page: data?.page || 1,
                totalPages: data?.totalPages || 1,
                total: data?.total || 0,
              }}
              onPageChange={handlePageChange}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Modals */}

      <AnimatePresence>
        {modalType === "vehicle-details" && <VehicleModal />}
        {modalType === "vehicle-create" && <VehicleModal isCreate />}
        {modalType === "fueling-create" && <FuelingModal />}
        {modalType === "incident-create" && <IncidentModal />}
        {modalType === "document-create" && <DocumentModal />}
        {modalType === "confirm-delete" && <ConfirmDeleteVehicleModal />}
      </AnimatePresence>
    </>
  );
}
