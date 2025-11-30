"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Fuel, X, Info, ChevronDown, ChevronUp, Upload } from "lucide-react"
import { useI18n } from "@/lib/i18n/i18n-context"
import { useModalStore } from "@/store/use-modal-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { FuelType } from "@/types/vehicle"

const fuelingSchema = z.object({
  provider: z.string().min(1, "Posto é obrigatório"),
  fuelType: z.enum(["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"]),
  liters: z.number().min(0.1, "Quantidade de litros é obrigatória"),
  totalValue: z.number().min(0.01, "Valor total é obrigatório"),
  unitPrice: z.number().min(0.01, "Preço unitário é obrigatório"),
  odometer: z.number().min(0, "Odômetro é obrigatório"),
  odometerStop: z.number().optional(),
  date: z.string().min(1, "Data é obrigatória"),
})

type FuelingFormData = z.infer<typeof fuelingSchema>

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
}

export function FuelingModal() {
  const { t } = useI18n()
  const { data, closeModal, isOpen } = useModalStore()
  const vehicleId = data.vehicleId as string
  const queryClient = useQueryClient()

  const [generalOpen, setGeneralOpen] = useState(true)
  const [receiptOpen, setReceiptOpen] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FuelingFormData>({
    resolver: zodResolver(fuelingSchema),
    defaultValues: {
      fuelType: "DIESEL",
      odometer: 30000,
      liters: 0,
      totalValue: 0,
      unitPrice: 0,
    },
  })

  const createFueling = useMutation({
    mutationFn: async (formData: FuelingFormData) => {
      const { data } = await api.post("/fuelings", {
        ...formData,
        vehicleId,
        date: new Date(formData.date).toISOString(),
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] })
      closeModal()
    },
  })

  const onSubmit = async (formData: FuelingFormData) => {
    await createFueling.mutateAsync(formData)
  }

  const fuelTypes: FuelType[] = ["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"]

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-lg p-0">
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Fuel className="h-5 w-5 text-foreground" />
                </div>
                <DialogTitle className="text-lg font-semibold">{t.fueling.title}</DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
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
                      <span className="font-medium">{t.vehicles.generalData}</span>
                    </div>
                    {generalOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pt-0 space-y-4">
                    {/* Row 1: Fuel Station */}
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {t.fueling.fuelStation} <span className="text-muted-foreground">(#18098)</span>
                      </label>
                      <Input {...register("provider")} placeholder="Nome do posto" className="h-9" />
                      {errors.provider && <span className="text-xs text-destructive">{errors.provider.message}</span>}
                    </div>

                    {/* Row 2: KM, KM Stop */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">{t.fueling.odometer}</label>
                        <Input type="number" {...register("odometer", { valueAsNumber: true })} className="h-9" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">{t.fueling.odometerStop}</label>
                        <Input type="number" {...register("odometerStop", { valueAsNumber: true })} className="h-9" />
                      </div>
                    </div>

                    {/* Row 3: Fuel Type, Liters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.fueling.fuelType} <span className="text-muted-foreground">(#1337)</span>
                        </label>
                        <Select
                          value={watch("fuelType")}
                          onValueChange={(value) => setValue("fuelType", value as FuelType)}
                        >
                          <SelectTrigger className="h-9">
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
                      <div>
                        <label className="text-xs text-muted-foreground">{t.fueling.quantity}</label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register("liters", { valueAsNumber: true })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Row 4: Date, Total Value */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">{t.fueling.date}</label>
                        <Input type="date" {...register("date")} className="h-9" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">{t.fueling.totalValue}</label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register("totalValue", { valueAsNumber: true })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Hidden: Unit Price (calculated) */}
                    <input type="hidden" {...register("unitPrice", { valueAsNumber: true })} />
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Comprovante */}
            <Collapsible open={receiptOpen} onOpenChange={setReceiptOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{t.fueling.receipt}</span>
                    </div>
                    {receiptOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pt-0">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                      <Info className="h-6 w-6 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">{t.common.uploadFiles}</p>
                      <p className="text-sm text-muted-foreground">{t.common.dragDrop}</p>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                {t.common.close}
              </Button>
              <Button type="submit" disabled={createFueling.isPending}>
                {createFueling.isPending ? t.common.loading : t.common.register}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
