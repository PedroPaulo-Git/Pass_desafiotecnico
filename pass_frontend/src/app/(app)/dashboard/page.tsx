"use client"

import { motion } from "framer-motion"
import { Bus, Fuel, FileWarning, FileText, TrendingUp, AlertTriangle, Truck } from "lucide-react"
import { useI18n } from "@/lib/i18n/i18n-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useVehicles } from "@/features/vehicles/hooks/use-vehicles"
import { useFuelings } from "@/features/fleet-events/hooks/use-fuelings"
import { useIncidents } from "@/features/fleet-events/hooks/use-incidents"
import { useVehicleDocuments } from "@/features/fleet-events/hooks/use-vehicle-documents"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      // use cubic-bezier numeric array to satisfy typing
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export default function DashboardPage() {
  const { t } = useI18n()

  // fetch small paginated responses and read the `total` count
  const { data: vehiclesData } = useVehicles({ page: 1, limit: 1 })
  const { data: fuelingsData } = useFuelings({ page: 1, limit: 1 })
  const { data: incidentsData } = useIncidents({ page: 1, limit: 1 })
  const { data: documentsData } = useVehicleDocuments({ page: 1, limit: 1 })

  const stats = [
    {
      title: t.nav.vehicles,
      value: String(vehiclesData?.total ?? 0),
      change: "+0",
      icon: Bus,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t.fueling.title,
      value: String(fuelingsData?.total ?? 0),
      change: "+0",
      icon: Fuel,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: t.incidents.title,
      value: String(incidentsData?.total ?? 0),
      change: "+0",
      icon: FileWarning,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: t.documents.title,
      value: String(documentsData?.total ?? 0),
      change: "+0",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.nav.dashboard}</h1>
          <p className="text-muted-foreground">{t.home.description}</p>
        </div>

        <div>
          <Link href="/vehicles">
            <Button className="flex items-center gap-2" aria-label={t.vehicles?.manageFleet ?? "Manage fleet"}>
              <Truck className="h-4 w-4" />
              {t.vehicles?.manageFleet ?? "Gerenciar frota"}
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{stat.change}</span>
                  <span>vs. mês anterior</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <FileText className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Tacógrafo - Veículo 316</p>
                  <p className="text-xs text-muted-foreground">Vence em 15 dias</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <FileWarning className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Licenciamento - Veículo 312</p>
                  <p className="text-xs text-muted-foreground">Vencido há 3 dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
