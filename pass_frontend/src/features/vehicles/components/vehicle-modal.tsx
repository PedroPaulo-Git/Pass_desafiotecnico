"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  createVehicleSchema,
  updateVehicleSchema,
} from "@pass/schemas";
import {
  Bus,
  X,
  Info,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Trash2,
  MoreVertical,
  FileText,
  CarFront,
} from "lucide-react";
import { FaCar } from "react-icons/fa6";
import { FaRegListAlt } from "react-icons/fa";
import { MdOutlineImageSearch, MdCamera } from "react-icons/md";
import { PiTrashSimpleBold  } from "react-icons/pi";

import { format } from "date-fns";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useUpdateVehicle, useCreateVehicle } from "../hooks/use-vehicles";
import { useVehicleSubmit } from "../hooks/use-vehicle-submit";
import {
  useVehicleImages,
  useCreateVehicleImage,
  useDeleteVehicleImage,
} from "@/features/fleet-events/hooks/use-vehicle-images";
import { toast as sonnerToast } from "sonner";
import { makePreSubmitHandler } from "../hooks/make-pre-submit-handler";
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
import { FormInput } from "@/features/vehicles/components/fields/form-input";
import {
  formatPlate,
  formatRenavam,
  formatChassis,
  formatUf,
  formatLetters,
} from "@/lib/formatters/vehicleFormatters";
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

  // determine whether we are in creating mode early so the resolver can use it
  const isCreating = isCreate || !vehicle;

  const [generalOpen, setGeneralOpen] = useState(true);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [imagesOpen, setImagesOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingImages, setIsDeletingImages] = useState(false);

  const { data: imagesData } = useVehicleImages(vehicle?.id || "");
  const createImage = useCreateVehicleImage();
  const deleteImage = useDeleteVehicleImage();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vehicle?.id) return;

    // Validate file type (only images allowed) - check both MIME type and extension
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."));

    const isValidMimeType = file.type && validImageTypes.includes(file.type);
    const isValidExtension = validExtensions.includes(fileExtension);

    if (!isValidMimeType || !isValidExtension) {
      sonnerToast.error(
        t.common.invalidFileType ||
          "Arquivo inválido. Envie apenas imagens (JPG, PNG, GIF, WebP, SVG)"
      );
      e.target.value = ""; // Reset input
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await createImage.mutateAsync({ vehicleId: vehicle.id, url: base64 });
        sonnerToast.success(t.common.success || "Image uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      sonnerToast.error(t.common.error || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!vehicle?.id) return;

    deleteImage.mutate(
      { imageId, vehicleId: vehicle.id },
      {
        onSuccess: () => {
          sonnerToast.success(
            t.common.success || "Imagem removida com sucesso"
          );
        },
        onError: () => {
          sonnerToast.error(t.common.error || "Erro ao remover imagem");
        },
      }
    );
  };

  const handleDeleteAllImages = async () => {
    if (!vehicle?.id) {
      sonnerToast.error(t.common.error || "Vehicle ID não disponível");
      return;
    }

    const imgs = imagesData || [];
    if (!imgs.length) {
      sonnerToast.error(t.common.error || "Nenhuma imagem encontrada");
      return;
    }

    setIsDeletingImages(true);
    try {
      await Promise.all(
        imgs.map((img: any) =>
          // use mutateAsync provided by react-query
          // @ts-ignore
          deleteImage.mutateAsync({ imageId: img.id, vehicleId: vehicle.id })
        )
      );
      sonnerToast.success(
        t.common.success || "Todas as imagens foram removidas"
      );
    } catch (err) {
      sonnerToast.error(t.common.error || "Erro ao remover todas as imagens");
    } finally {
      setIsDeletingImages(false);
    }
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<CreateVehicleInput | UpdateVehicleInput>({
    resolver: zodResolver(isCreate ? createVehicleSchema : updateVehicleSchema),
    mode: "onSubmit",
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

  // If the modal is opened in create mode, ensure the form is cleared.
  // This handles the case where React may reuse the same component instance
  // when switching between detail/create modal types — calling `reset()`
  // without args restores defaultValues defined in useForm.
  useEffect(() => {
    if (isCreate && isOpen) {
      reset();
    }
  }, [isCreate, isOpen, reset]);

  // clear description error when user types something
  const descriptionValue = watch("description");
  useEffect(() => {
    if (descriptionValue && String(descriptionValue).trim().length > 0) {
      clearErrors("description");
    }
  }, [descriptionValue, clearErrors]);

  const onSubmit = useVehicleSubmit({
    isCreating,
    vehicle,
    updateVehicle,
    createVehicle,
    closeModal,
    t,
    toast: sonnerToast,
    setError,
  });

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "LIBERADO":
        return "bg-[#0c9d3c] hover:bg-[#0c9d3c]/80";
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
        className="w-[min(100vw,900px)] max-h-[98vh] overflow-y-auto p-0  "
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <DialogHeader className="sticky z-10 backdrop-blur-lg bg-transparent top-0 px-3 py-4 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-lg">
                  <FaCar className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {isCreate ? t.vehicles.newTitle : t.vehicles.title}
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
            onSubmit={makePreSubmitHandler({
              isCreating,
              getValues: getValues as () => CreateVehicleInput,
              setError: setError as UseFormSetError<CreateVehicleInput>,
              t,
              toast: sonnerToast,
              handleSubmit: handleSubmit as any,
              onSubmit,
            })}
            className="px-2 pb-4 space-y-2"
          >
            {/* Dados Gerais */}
            <Collapsible open={generalOpen} onOpenChange={setGeneralOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Info className="h-5 w-5 font-bold" />
                      <span className="font-semibold">
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
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          ID
                        </label>
                        <p className="text-sm font-medium">
                          {vehicle?.id?.slice(4, 6) || "-"}
                        </p>
                      </div>
                      <div className="col-span-2 w-full ">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.createdAt}
                        </label>
                        <p className="text-sm whitespace-nowrap overflow-x-hidden">
                          {vehicle
                            ? format(
                                new Date(vehicle.createdAt),
                                "dd/MM/yyyy HH:mm"
                              )
                            : "-"}
                        </p>
                      </div>
                      <div className="col-span-2 w-full ">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.identifier}
                        </label>
                        <FormInput
                          name="internalId"
                          control={control}
                          rules={{
                            required: "Identificador é obrigatório",
                            pattern: {
                              value: /^\d+$/,
                              message:
                                "Identificador deve conter apenas números",
                            },
                            maxLength: {
                              value: 10,
                              message:
                                "Identificador deve ter no máximo 10 dígitos",
                            },
                          }}
                          placeholder="316"
                          className="h-8"
                          formatter={(v: string) =>
                            (v || "").toString().replace(/\D/g, "").slice(0, 10)
                          }
                          clearErrors={() => clearErrors("internalId")}
                        />
                        {errors.internalId?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.internalId.message)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 w-full ">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.company}
                          <span className=" pl-2">(#180461)</span>
                        </label>
                        <Select
                          value={watch("companyName") || ""}
                          onValueChange={(value) =>
                            setValue("companyName", value)
                          }
                        >
                          <SelectTrigger className="h-8 ">
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
                      <div className="col-span-3 ">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.status}
                          <span className=" pl-2">(#180451)</span>
                        </label>
                        <Select
                          value={watch("status")}
                          onValueChange={(value) =>
                            setValue("status", value as VehicleStatus)
                          }
                        >
                          <SelectTrigger iconRight={true} className="h-8  ">
                            <SelectValue>
                              <Badge
                                className={`${
                                  getStatusColor(
                                    watch("status")
                                  ) as VehicleStatus
                                } text-white font-semibold border-0 px-18 py-2 rounded-2xl `}
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
                              <SelectItem
                                key={status}
                                value={status}
                                className=""
                              >
                                <Badge
                                  className={`${getStatusColor(
                                    status
                                  )} text-white font-semibold border-0 `}
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
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.model}
                        </label>
                        <FormInput
                          name="model"
                          control={control}
                          rules={{
                            required: "Modelo é obrigatório",
                            pattern: {
                              value: /^[\p{L} \-\.]+$/u,
                              message: "Modelo não pode conter números",
                            },
                          }}
                          className="h-8"
                          formatter={formatLetters}
                          placeholder="Busscar Buss Vissta 340"
                          clearErrors={
                            clearErrors as (name?: string | string[]) => void
                          }
                        />
                        {errors.model?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.model.message)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.year}
                        </label>
                        <Input
                          type="number"
                          {...register("year", { valueAsNumber: true })}
                          className="h-8"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.brand}
                        </label>
                        <FormInput
                          name="brand"
                          control={control}
                          rules={{
                            required: "Marca é obrigatória",
                            pattern: {
                              value: /^[\p{L} \-\.]+$/u,
                              message: "Marca não pode conter números",
                            },
                          }}
                          className="h-8"
                          formatter={formatLetters}
                          placeholder="Scania"
                          clearErrors={
                            clearErrors as (name?: string | string[]) => void
                          }
                        />
                        {errors.brand?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.brand.message)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.category}
                          <span className=" pl-2">(#1106)</span>
                        </label>
                        <Select
                          value={watch("category")}
                          onValueChange={(value) =>
                            setValue("category", value as VehicleCategory)
                          }
                        >
                          <SelectTrigger className="h-8 ">
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
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.classification}
                          <span className=" pl-2">(#1105)</span>
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
                          <SelectTrigger className="h-8 ">
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
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.capacity}
                        </label>
                        <Input
                          type="number"
                          {...register("capacity", { valueAsNumber: true })}
                          className="h-8"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.doors}
                        </label>
                        <Input
                          type="number"
                          {...register("doors", { valueAsNumber: true })}
                          className="h-8"
                        />
                      </div>

                      {/* State Search - placed after Doors for quick lookup */}
                      <div className="col-span-4">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.searchState}
                        </label>
                        <FormInput
                          name="stateSearch"
                          control={control}
                          rules={{}}
                          // placeholder={t.vehicles.searchState || 'Search'}
                          className="h-8"
                          clearErrors={() => {}}
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.state}
                        </label>
                        <FormInput
                          name="state"
                          control={control}
                          rules={{
                            required: "UF é obrigatória",
                            pattern: {
                              value: /^[A-Z]{2}$/,
                              message: "UF deve conter 2 letras",
                            },
                          }}
                          placeholder="RJ"
                          className="h-8"
                          formatter={formatUf}
                          clearErrors={
                            clearErrors as (name?: string | string[]) => void
                          }
                        />
                        {errors.state?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.state.message)}
                          </span>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.plateType}
                        </label>
                        <Select defaultValue="mercosul">
                          <SelectTrigger className="h-8 ">
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
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.plate}
                        </label>
                        <FormInput
                          name="plate"
                          control={control}
                          rules={
                            isCreating
                              ? {
                                  required: "Campo obrigatório",
                                  validate: (v: string) => {
                                    const clean = (v || "").replace(/-/g, "");
                                    return (
                                      clean.length >= 6 || "Placa inválida"
                                    );
                                  },
                                }
                              : {}
                          }
                          className="h-8 "
                          disabled={!isCreating}
                          formatter={formatPlate}
                          placeholder="SQX8A12"
                          clearErrors={
                            clearErrors as (name?: string | string[]) => void
                          }
                        />
                        {errors.plate?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.plate.message)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.renavam}
                        </label>
                        <FormInput
                          name="renavam"
                          control={control}
                          rules={
                            isCreating
                              ? {
                                  required: "Campo obrigatório",
                                  pattern: {
                                    value: /^\d{11}$/,
                                    message: "Renavam deve ter 11 dígitos",
                                  },
                                }
                              : {}
                          }
                          className="h-8 "
                          inputMode="numeric"
                          disabled={!isCreating}
                          placeholder="1365373352"
                          formatter={formatRenavam}
                          clearErrors={
                            clearErrors as (name?: string | string[]) => void
                          }
                        />
                        {errors.renavam?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.renavam.message)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-4">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.chassis}
                        </label>
                        <FormInput
                          name="chassis"
                          control={control}
                          rules={
                            isCreating
                              ? {
                                  required: "Campo obrigatório",
                                  pattern: {
                                    value: /^[A-Z0-9]{17}$/,
                                    message:
                                      "Chassi deve ter 17 caracteres alfanuméricos",
                                  },
                                }
                              : {}
                          }
                          className="h-8 "
                          placeholder="9BSK4X200P4018406"
                          disabled={!isCreating}
                          formatter={formatChassis}
                          clearErrors={
                            clearErrors as (name?: string | string[]) => void
                          }
                        />
                        {errors.chassis?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.chassis.message)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.currentKm}
                        </label>
                        <Input
                          type="number"
                          placeholder=""
                          {...register("currentKm", { valueAsNumber: true })}
                          className="h-8"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">
                          {t.vehicles.fuelType}
                          <span className=" pl-2">(#1337)</span>
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
                          {errors.fuelType?.message && (
                            <span className="text-xs text-destructive">
                              {String(errors.fuelType.message)}
                            </span>
                          )}
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4 mt-10">
                      <div className="col-span-2">
                        <Select
                          value={watch("color")}
                          onValueChange={(value) =>
                            setValue("color", value as FuelType)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue
                              placeholder={"Caracteristicas (#180471)"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Branco">Branco</SelectItem>
                            <SelectItem value="Preto">Preto</SelectItem>
                            <SelectItem value="Cinza">Cinza</SelectItem>
                            <SelectItem value="Azul">Azul</SelectItem>
                            <SelectItem value="Vermelho">Vermelho</SelectItem>
                            <SelectItem value="Verde">Verde</SelectItem>
                            <SelectItem value="Amarelo">Amarelo</SelectItem>
                            <SelectItem value="Prata">Prata</SelectItem>
                            <SelectItem value="Marrom">Marrom</SelectItem>
                            <SelectItem value="Laranja">Laranja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
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
                    <div className="flex items-center gap-1.5">
                      <FaRegListAlt className="h-4 w-4 font-bold" />
                      <span className="font-semibold">
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
                      variant="underlined"
                      {...register("description", {
                        required: "Descrição é obrigatória",
                      })}
                      placeholder="316"
                    />
                    {errors.description?.message && (
                      <span className="text-xs text-destructive">
                        {String(errors.description.message)}
                      </span>
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
                    <div className="flex items-center gap-2 ">
                      <MdOutlineImageSearch className="h-5 w-5 font-bold" />
                      <span className="font-semibold">{t.vehicles.images}</span>
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
                    {vehicle ? (
                      <div className="flex flex-wrap gap-3">
                        {/* Upload Box */}
                        <label
                          className="w-24 h-24 px-2 border-2 border-dashed border-foreground
                         rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="hidden"
                          />
                          <MdCamera className="h-8 w-8 mb-1" />
                          <span className="text-xs text-center ">
                            {isUploading
                              ? "Uploading..."
                              : t.common.uploadFiles}
                          </span>
                        </label>
                        {/* Existing Images */}
                        {imagesData?.map((image, index) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative w-44 h-24 rounded-md overflow-hidden group"
                          >
                            <img
                              src={image.url}
                              alt={`Vehicle ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
                                onClick={() => handleDeleteImage(image.id)}
                              >
                                <Trash2 className="h-4 w-4 font-bold" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                        <div className="w-full my-3 flex items-center">
                          <PiTrashSimpleBold 
                            onClick={handleDeleteAllImages}
                            className="h-4 w-4 hover:text-red-500 cursor-pointer "
                          />

                          <p className="text-xs ml-2 font-normal">
                            Excluir todos arquivos
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t.common.saveVehicleFirst ||
                          "Save vehicle first to upload images"}
                      </p>
                    )}
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
