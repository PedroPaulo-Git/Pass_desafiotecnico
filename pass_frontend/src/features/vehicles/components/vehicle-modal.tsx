"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateVehicleInput, createVehicleSchema } from "@pass/schemas/vehicleSchema"
import { Bus, X, Info, ChevronDown, ChevronUp, ImagePlus, Trash2, MoreVertical, FileText, CarFront } from "lucide-react"
import { format } from "date-fns"
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useUpdateVehicle, useCreateVehicle } from "../hooks/use-vehicles";
import { toast as sonnerToast } from "sonner";
import { FuelingsSection } from "./fuelings-section";
import { IncidentsSection } from "./incidents-section";
import { DocumentsSection } from "./documents-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  Vehicle,
  VehicleStatus,
  VehicleCategory,
  VehicleClassification,
  FuelType,
} from "@/types/vehicle";

interface VehicleModalProps {
  isCreate?: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export function VehicleModal({ isCreate = false }: VehicleModalProps) {
  const { t } = useI18n();
  const { data, closeModal, isOpen } = useModalStore();
  const vehicle = data.vehicle as Vehicle | undefined;
  const updateVehicle = useUpdateVehicle();
  const createVehicle = useCreateVehicle();

  const [generalOpen, setGeneralOpen] = useState(true);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [imagesOpen, setImagesOpen] = useState(true);
  const [characteristicsOpen, setCharacteristicsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    getValues,
    clearErrors,
    formState: { errors }
  } = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      status: "LIBERADO",
      category: "ONIBUS",
      classification: "BASIC",
      fuelType: "DIESEL",
      doors: 1,
      capacity: 46,
      currentKm: 0,
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        internalId: vehicle.internalId || "",
        plate: vehicle.plate,
        renavam: vehicle.renavam || "",
        chassis: vehicle.chassis || "",
        model: vehicle.model,
        brand: vehicle.brand,
        year: vehicle.year,
        color: vehicle.color || "",
        category: vehicle.category,
        classification: vehicle.classification,
        capacity: vehicle.capacity,
        doors: vehicle.doors,
        fuelType: vehicle.fuelType,
        state: vehicle.state || "",
        currentKm: vehicle.currentKm,
        status: vehicle.status,
        companyName: vehicle.companyName || "",
        description: vehicle.description || "",
      });
    }
  }, [vehicle, reset]);

  const isCreating = isCreate || !vehicle;

  // helpers to keep inputs formatted while typing
  const formatPlate = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (cleaned.length > 3) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}`.slice(0, 8);
    return cleaned;
  };

  const onPlateChange = (e: any) => {
    const raw = e.target.value;
    const v = formatPlate(raw);
    setValue("plate", v);
    const clean = v.replace(/-/g, "");
    if (clean.length >= 6) clearErrors("plate");
  };

  const onRenavamChange = (e: any) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setValue("renavam", digits);
    if (digits.length === 11) clearErrors("renavam");
  };

  const onChassisChange = (e: any) => {
    const alnum = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 17);
    setValue("chassis", alnum);
    if (alnum.length === 17) clearErrors("chassis");
  };

  const onUfChange = (e: any) => {
    const letters = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
    setValue("state", letters);
    if (letters.length === 2) clearErrors("state");
  };

  const onBrandChange = (e: any) => {
    const letters = e.target.value.replace(/[^\p{L} \-\.]/gu, "");
    setValue("brand", letters);
    if (String(letters).trim().length > 0) clearErrors("brand");
  };

   const onModelChange = (e: any) => {
    const letters = e.target.value.replace(/[^\p{L} \-\.]/gu, "");
    setValue("model", letters);
    if (String(letters).trim().length > 0) clearErrors("model");
  };

  const onInternalIdChange = (e: any) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setValue("internalId", digits);
    if (digits.length > 0 && digits.length <= 10) clearErrors("internalId");
  };

  // clear description error when user types something
  const descriptionValue = watch("description");
  useEffect(() => {
    if (descriptionValue && String(descriptionValue).trim().length > 0) {
      clearErrors("description");
    }
  }, [descriptionValue, clearErrors]);

  const onSubmit = async (formData: CreateVehicleInput) => {
    // client-side gate: ensure required fields on create are present
    if (isCreating) {
      let hasErrors = false;

      const plateClean = (formData.plate ?? "").toString().replace(/-/g, "").trim();
      if (!plateClean) {
        setError("plate", { type: "required", message: "Placa é obrigatória" });
        hasErrors = true;
      }

      if (!formData.state || String(formData.state).trim().length === 0) {
        setError("state", { type: "required", message: "UF é obrigatória" });
        hasErrors = true;
      }

      const ren = (formData.renavam ?? "").toString().replace(/\D/g, "");
      if (!ren || ren.length !== 11) {
        setError("renavam", { type: "required", message: "Renavam deve ter 11 dígitos" });
        hasErrors = true;
      }

      const ch = (formData.chassis ?? "").toString().toUpperCase();
      if (!ch || ch.length !== 17) {
        setError("chassis", { type: "required", message: "Chassi deve ter 17 caracteres" });
        hasErrors = true;
      }

      if (!formData.brand || String(formData.brand).trim().length === 0) {
        setError("brand", { type: "required", message: "Marca é obrigatória" });
        hasErrors = true;
      }

      if (!formData.description || String(formData.description).trim().length === 0) {
        setError("description", { type: "required", message: "Descrição é obrigatória" });
        hasErrors = true;
      }

      if (hasErrors) {
        sonnerToast.error("Verifique os campos obrigatórios")
        return
      }
    }

    try {
      // sanitize fields before sending
      const payload = {
        ...formData,
        plate: (formData.plate ?? "").toString().replace(/-/g, ""),
        renavam: (formData.renavam ?? "").toString().replace(/\D/g, ""),
        chassis: (formData.chassis ?? "").toString().toUpperCase(),
        state: (formData.state ?? "").toString().toUpperCase(),
        brand: (formData.brand ?? "").toString().trim(),
        description: (formData.description ?? "").toString().trim(),
      } as CreateVehicleInput;

      if (vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, ...payload });
        sonnerToast.success("Veículo atualizado com sucesso");
        closeModal();
        return;
      }
      await createVehicle.mutateAsync(payload);
      sonnerToast.success("Veículo criado com sucesso");
      closeModal();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? "Erro ao salvar veículo";
      sonnerToast.error(String(message));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIBERADO":
        return "bg-green-500 hover:bg-green-500/80";
      case "EM_MANUTENCAO":
        return "bg-yellow-500 hover:bg-yellow-500/80";
      case "INDISPONIVEL":
        return "bg-red-500 hover:bg-red-500/80";
      case "VENDIDO":
        return "bg-gray-500 hover:bg-gray-500/80";
      default:
        return "bg-gray-500";
    }
  };

  const statuses: VehicleStatus[] = [
    "LIBERADO",
    "EM_MANUTENCAO",
    "INDISPONIVEL",
    "VENDIDO",
  ];
  const categories: VehicleCategory[] = ["ONIBUS", "VAN", "CARRO", "CAMINHAO"];
  const classifications: VehicleClassification[] = [
    "PREMIUM",
    "BASIC",
    "EXECUTIVO",
  ];
  const fuelTypes: FuelType[] = [
    "DIESEL",
    "DIESEL_S10",
    "GASOLINA",
    "ETANOL",
    "ARLA32",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        fullWidth
        showInfo={false}
        showCloseButton={false}
        className="max-w-none md:w-[min(40vw,900px)] max-h-[90vh] overflow-y-auto p-0"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <DialogHeader className="sticky z-10 backdrop-blur-lg bg-transparent top-0 px-6 py-4 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <CarFront className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {isCreate ? "Novo Veículo" : t.vehicles.title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {t.vehicles.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => {}}>
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  className="border border-gray-500 rounded-full top-4 right-4 p-1.5 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="h-4 w-4 " />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const values = getValues();
              // pre-submit check (runs before resolver)
              if (isCreating) {
                let hasErrors = false;
                const plateClean = (values.plate ?? "").toString().replace(/-/g, "").trim();
                if (!plateClean) {
                  setError("plate", { type: "required", message: "Placa é obrigatória" });
                  hasErrors = true;
                }
                if (!values.state || String(values.state).trim().length === 0) {
                  setError("state", { type: "required", message: "UF é obrigatória" });
                  hasErrors = true;
                }
                const ren = (values.renavam ?? "").toString().replace(/\D/g, "");
                if (!ren || ren.length !== 11) {
                  setError("renavam", { type: "required", message: "Renavam deve ter 11 dígitos" });
                  hasErrors = true;
                }
                const ch = (values.chassis ?? "").toString().toUpperCase();
                if (!ch || ch.length !== 17) {
                  setError("chassis", { type: "required", message: "Chassi deve ter 17 caracteres" });
                  hasErrors = true;
                }
                if (!values.brand || String(values.brand).trim().length === 0) {
                  setError("brand", { type: "required", message: "Marca é obrigatória" });
                  hasErrors = true;
                }
                 if (!values.model || String(values.model).trim().length === 0) {
                  setError("model", { type: "required", message: "Marca é obrigatória" });
                  hasErrors = true;
                }
                if (!values.description || String(values.description).trim().length === 0) {
                  setError("description", { type: "required", message: "Descrição é obrigatória" });
                  hasErrors = true;
                }
                if (hasErrors) {
                  sonnerToast.error("Verifique os campos obrigatórios");
                  return;
                }
              }
              // run react-hook-form validation and then onSubmit
              await handleSubmit(onSubmit)(e as any);
            }}
            className="px-2 pb-4 space-y-4"
          >
            {/* Dados Gerais */}
            <Collapsible open={generalOpen} onOpenChange={setGeneralOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {t.vehicles.generalData}
                      </span>
                    </div>
                    {generalOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 pt-0 space-y-4"
                  >
                    {/* Row 1: ID, Created, Identifier, Company, Status */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          ID
                        </label>
                        <p className="text-sm font-medium">
                          {vehicle?.id?.slice(0, 8) || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.createdAt}
                        </label>
                        <p className="text-sm">
                          {vehicle
                            ? format(
                                new Date(vehicle.createdAt),
                                "dd/MM/yyyy HH:mm"
                              )
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.identifier}
                        </label>
                        <Input
                          {...register("internalId", {
                            required: "Identificador é obrigatório",
                            pattern: {
                              value: /^\d+$/,
                              message: "Identificador deve conter apenas números",
                            },
                            maxLength: {
                              value: 10,
                              message: "Identificador deve ter no máximo 10 dígitos",
                            },
                          })}
                          placeholder="316"
                          className="h-8"
                          onChange={onInternalIdChange}
                        />
                        {errors.internalId?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.internalId.message)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.company}
                        </label>
                        <Select
                          value={watch("companyName") || ""}
                          onValueChange={(value) =>
                            setValue("companyName", value)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inbuzios Receptivo">
                              Inbuzios Receptivo
                            </SelectItem>
                            <SelectItem value="Companhia A">
                              Companhia A
                            </SelectItem>
                            <SelectItem value="Companhia B">
                              Companhia B
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.status}
                        </label>
                        <Select
                          value={watch("status")}
                          onValueChange={(value) =>
                            setValue("status", value as VehicleStatus)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue>
                              <Badge
                                className={`${
                                  getStatusColor(
                                    watch("status")
                                  ) as VehicleStatus
                                } text-white border-0`}
                              >
                                {
                                  t.status[
                                    watch("status") as keyof typeof t.status
                                  ]
                                }
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                <Badge
                                  className={`${getStatusColor(
                                    status
                                  )} text-white border-0`}
                                >
                                  {t.status[status]}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 2: Model, Year, Brand, Category, Classification */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.model}
                        </label>
                        <Input  {...register("model", {
                            required: "Modelo é obrigatório",
                            pattern: {
                              value: /^[\p{L} \-\.]+$/u,
                              message: "Modelo não pode conter números",
                            },
                          })}className="h-8"
                          onChange={onModelChange} />
                        {errors.model?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.model.message)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.year}
                        </label>
                        <Input
                          type="number"
                          {...register("year", { valueAsNumber: true })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.brand}
                        </label>
                        <Input
                          {...register("brand", {
                            required: "Marca é obrigatória",
                            pattern: {
                              value: /^[\p{L} \-\.]+$/u,
                              message: "Marca não pode conter números",
                            },
                          })}
                          className="h-8"
                          onChange={onBrandChange}
                        />
                        {errors.brand?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.brand.message)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.category}
                        </label>
                        <Select
                          value={watch("category")}
                          onValueChange={(value) =>
                            setValue("category", value as VehicleCategory)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {t.categories[cat]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.classification}
                        </label>
                        <Select
                          value={watch("classification")}
                          onValueChange={(value) =>
                            setValue(
                              "classification",
                              value as VehicleClassification
                            )
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {classifications.map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                {t.classifications[cls]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 3: Capacity, Doors, State Search, UF, Plate Type */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.capacity}
                        </label>
                        <Input
                          type="number"
                          {...register("capacity", { valueAsNumber: true })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.doors}
                        </label>
                        <Input
                          type="number"
                          {...register("doors", { valueAsNumber: true })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.searchState}
                        </label>
                        <Input placeholder="Buscar estado" className="h-8" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.state}
                        </label>
                        <Input
                          {...register("state", {
                            required: "UF é obrigatória",
                            pattern: {
                              value: /^[A-Z]{2}$/,
                              message: "UF deve conter 2 letras",
                            },
                          })}
                          placeholder="RJ"
                          className="h-8"
                          onChange={onUfChange}
                        />
                        {errors.state?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.state.message)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.plateType}
                        </label>
                        <Select defaultValue="mercosul">
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mercosul">Mercosul</SelectItem>
                            <SelectItem value="antiga">Antiga</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 4: Plate, Renavam, Chassis, Current Km, Fuel Type */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.plate}
                        </label>
                        <Input
                          {...(isCreating
                            ? register("plate", {
                                required: "Campo obrigatório",
                                validate: (v: string) => {
                                  const clean = (v || "").replace(/-/g, "");
                                  return clean.length >= 6 || "Placa inválida";
                                },
                              })
                            : register("plate"))}
                          className="h-8 font-mono"
                          // required={isCreating}
                          disabled={!isCreating}
                          onChange={onPlateChange}
                        />
                        {errors.plate?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.plate.message)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.renavam}
                        </label>
                        <Input
                          inputMode="numeric"
                          {...(isCreating
                            ? register("renavam", {
                                required: "Campo obrigatório",
                                pattern: {
                                  value: /^\d{11}$/,
                                  message: "Renavam deve ter 11 dígitos",
                                },
                              })
                            : register("renavam"))}
                          className="h-8 font-mono"
                          disabled={!isCreating}
                          onChange={onRenavamChange}
                        />
                        {errors.renavam?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.renavam.message)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.chassis}
                        </label>
                        <Input
                          {...(isCreating
                            ? register("chassis", {
                                required: "Campo obrigatório",
                                pattern: {
                                  value: /^[A-Z0-9]{17}$/,
                                  message: "Chassi deve ter 17 caracteres alfanuméricos",
                                },
                              })
                            : register("chassis"))}
                          className="h-8 font-mono"
                          disabled={!isCreating}
                          onChange={onChassisChange}
                        />
                        {errors.chassis?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.chassis.message)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.currentKm}
                        </label>
                        <Input
                          type="number"
                          {...register("currentKm", { valueAsNumber: true })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.fuelType}
                        </label>
                        <Select
                          value={watch("fuelType")}
                          onValueChange={(value) =>
                            setValue("fuelType", value as FuelType)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fuelTypes.map((fuel) => (
                              <SelectItem key={fuel} value={fuel}>
                                {t.fuelTypes[fuel]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Características */}

            <Collapsible
              open={characteristicsOpen}
              onOpenChange={setCharacteristicsOpen}
            >
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {t.vehicles.characteristics}
                      </span>
                    </div>
                    {characteristicsOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      Características adicionais do veículo podem ser
                      adicionadas aqui.
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Descrição */}
            <Collapsible
              open={descriptionOpen}
              onOpenChange={setDescriptionOpen}
            >
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {t.vehicles.description}
                      </span>
                    </div>
                    {descriptionOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0">
                    <Textarea
                      {...register("description", { required: "Descrição é obrigatória" })}
                      placeholder="Descrição do veículo..."
                      className="min-h-[100px] resize-none"
                    />
                    {errors.description?.message && (
                      <span className="text-xs text-destructive">{String(errors.description.message)}</span>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Imagens do Veículo */}
            <Collapsible open={imagesOpen} onOpenChange={setImagesOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{t.vehicles.images}</span>
                    </div>
                    {imagesOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0">
                    <div className="flex flex-wrap gap-3">
                      {/* Upload Box */}
                      <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                        <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-primary">
                          {t.common.uploadFiles}
                        </span>
                      </div>
                      {/* Existing Images */}
                      {vehicle?.images?.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative w-24 h-24 rounded-lg overflow-hidden group"
                        >
                          <img
                            src={
                              image.url ||
                              `/placeholder.svg?height=96&width=96&query=vehicle ${
                                index + 1
                              }`
                            }
                            alt={`Vehicle ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      {/* Placeholder images if no images */}
                      {(!vehicle?.images || vehicle.images.length === 0) && (
                        <>
                          <div className="w-24 h-24 rounded-lg overflow-hidden">
                            <img
                              // src="/black-sedan-car.jpg"
                              alt="Sample 1"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="w-24 h-24 rounded-lg overflow-hidden">
                            <img
                              // src="/green-mercedes-suv.jpg"
                              alt="Sample 2"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="w-24 h-24 rounded-lg overflow-hidden">
                            <img
                              // src="/white-bmw-luxury.jpg"
                              alt="Sample 3"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive mt-3 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t.common.deleteAll}
                    </button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Abastecimentos */}
            {vehicle && (
              <FuelingsSection
                vehicleId={vehicle.id}
                fuelings={vehicle.fuelings || []}
              />
            )}

            {/* Documentação */}
            {vehicle && (
              <DocumentsSection
                vehicleId={vehicle.id}
                documents={vehicle.documents || []}
              />
            )}

            {/* Ocorrências */}
            {vehicle && (
              <IncidentsSection
                vehicleId={vehicle.id}
                incidents={vehicle.incidents || []}
              />
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={closeModal}>
                {t.common.close}
              </Button>
              <Button
                type="submit"
                disabled={updateVehicle.isPending || createVehicle.isPending}
              >
                {updateVehicle.isPending || createVehicle.isPending
                  ? t.common.loading
                  : t.common.save}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
