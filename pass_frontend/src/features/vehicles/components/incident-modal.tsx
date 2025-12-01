"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CreateIncidentInput ,createIncidentSchema} from "@pass/schemas/incidentSchema"
import { AlertTriangle, X, Info, ChevronDown, ChevronUp, Upload } from "lucide-react"
import { useI18n } from "@/lib/i18n/i18n-context"
import { useModalStore } from "@/store/use-modal-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { SeverityLevel } from "@/types/vehicle"

const modalVariants:any= {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
}

export function IncidentModal() {
  const { t } = useI18n()
  const { data, closeModal, isOpen } = useModalStore()
  const vehicleId = data.vehicleId as string
  const queryClient = useQueryClient()

  const [generalOpen, setGeneralOpen] = useState(true)
  const [attachmentOpen, setAttachmentOpen] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      severity: "MEDIA",
    },
  })

  const createIncident = useMutation({
    mutationFn: async (formData: CreateIncidentInput) => {
      const { data } = await api.post("/incidents", {
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

  const onSubmit = async (formData: CreateIncidentInput) => {
    await createIncident.mutateAsync(formData)
  }

  const severityLevels: SeverityLevel[] = ["BAIXA", "MEDIA", "ALTA", "GRAVE"]
  const classifications = ["MULTA", "ACIDENTE", "AVARIA", "ROUBO", "OUTROS"]

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-lg p-0">
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">{t.incidents.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{t.incidents.subtitle}</p>
                </div>
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
                    {/* Row 1: Classification, Severity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.incidents.classification} <span className="text-muted-foreground">(#1104)</span>
                        </label>
                        <Select
                          value={watch("classification")}
                          onValueChange={(value) => setValue("classification", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {classifications.map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                {cls}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.classification && (
                          <span className="text-xs text-destructive">{errors.classification.message}</span>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.incidents.severity} <span className="text-muted-foreground">(#1103)</span>
                        </label>
                        <Select
                          value={watch("severity")}
                          onValueChange={(value) => setValue("severity", value as SeverityLevel)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {severityLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {t.severity[level]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 2: Date, Record */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">{t.incidents.date}</label>
                        <Input type="date" {...register("date")} className="h-9" />
                        {errors.date && <span className="text-xs text-destructive">{errors.date.message}</span>}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">{t.incidents.record}</label>
                        <Input {...register("title")} placeholder="Título da ocorrência" className="h-9" />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs text-muted-foreground">{t.incidents.description}</label>
                      <Textarea
                        {...register("description")}
                        placeholder="Descreva a ocorrência..."
                        className="min-h-20 resize-none"
                      />
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Anexo */}
            <Collapsible open={attachmentOpen} onOpenChange={setAttachmentOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{t.incidents.attachment}</span>
                    </div>
                    {attachmentOpen ? (
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
              <Button type="submit" disabled={createIncident.isPending}>
                {createIncident.isPending ? t.common.loading : t.common.register}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
