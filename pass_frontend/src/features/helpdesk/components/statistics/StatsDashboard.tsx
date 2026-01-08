"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useHelpdeskStatistics } from "../../hooks/use-helpdesk-statistics";
import { useAuth } from "@/hooks/use-auth";
import { TicketOverviewChart } from "./TicketOverviewChart";
import { TicketDistributionChart } from "./TicketDistributionChart";
import { MessagesActivityChart } from "./MessagesActivityChart";
import { PerformanceMetricsCard } from "./PerformanceMetricsCard";
import { Card } from "@/components/ui/card";
import { Loader2, BarChart3, AlertCircle } from "lucide-react";

interface StatsDashboardProps {
    isVisible: boolean;
}

export function StatsDashboard({ isVisible }: StatsDashboardProps) {
    const { currentUser } = useAuth();
    const { data: statistics, isLoading, error, isError } = useHelpdeskStatistics();

    if (!isVisible) return null;

    const containerVariants = {
        hidden: { opacity: 0, height: 0, marginBottom: 0 },
        visible: {
            opacity: 1,
            height: "auto",
            marginBottom: 16,
            transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                staggerChildren: 0.1,
            }
        },
        exit: {
            opacity: 0,
            height: 0,
            marginBottom: 0,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
            }
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
        },
    };

    // Loading state
    if (isLoading) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="loading"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="w-full"
                >
                    <Card className="rounded-[20px] p-12 border-0 shadow-custom! bg-[linear-gradient(to_bottom,#ffffff_8%,#f3f4f6_62%,#f3f4f6_100%)] dark:bg-[linear-gradient(to_bottom,#212121_2%,#191919_22%,#191919_100%)] dark:shadow-none">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <Loader2 className="size-8 text-purple-500 animate-spin" />
                            <div className="text-sm text-muted-foreground">Carregando estatísticas...</div>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Error state
    if (isError || !statistics) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="error"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    className="w-full"
                >
                    <Card className="rounded-[20px] p-12 border-0 shadow-custom! bg-[linear-gradient(to_bottom,#ffffff_8%,#f3f4f6_62%,#f3f4f6_100%)] dark:bg-[linear-gradient(to_bottom,#212121_2%,#191919_22%,#191919_100%)] dark:shadow-none">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <AlertCircle className="size-8 text-red-500" />
                            <div className="text-sm text-muted-foreground">
                                Erro ao carregar estatísticas. Tente novamente.
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        );
    }

    const getRoleTitle = () => {
        switch (currentUser?.role) {
            case "ADMIN":
                return "Dashboard Administrativo - Visão Completa";
            case "DEVELOPER":
                return "Dashboard do Desenvolvedor - Tickets Atribuídos";
            case "CLIENT":
            default:
                return "Dashboard do Cliente - Meus Tickets";
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="dashboard"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="w-full overflow-hidden"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2 pl-4">
                    <div className="p-2 rounded-lg bg-purple-500/15">
                        <BarChart3 className="size-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{getRoleTitle()}</h2>
                        <p className="text-xs text-muted-foreground">
                            Estatísticas em tempo real baseadas nos seus tickets
                        </p>
                    </div>
                </motion.div>

                {/* Charts Grid - 2 Rows Layout */}
                <div className="flex flex-col gap-6 p-4">
                    {/* Row 1: 3 Charts Side by Side */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Chart 1: Overview */}
                        <div className="lg:col-span-2">
                            <TicketOverviewChart
                                data={statistics.ticketsTrend}
                                percentageChange={statistics.percentageChange}
                                title="Tickets por Período"
                            />
                        </div>
                        {/* Chart 2: Distribution */}
                        <div className="lg:col-span-2">
                            <TicketDistributionChart
                                ticketsByStatus={statistics.ticketsByStatus}
                                ticketsByPriority={statistics.ticketsByPriority}
                                ticketsByModule={statistics.ticketsByModule}
                                total={statistics.totals.total}
                            />
                        </div>
                         {/* Chart 3: Messages Activity */}
                        <div className="lg:col-span-3">
                            <MessagesActivityChart
                                trendData={statistics.ticketsTrend}
                                messagesStats={statistics.messagesStats}
                            />
                        </div>

                        {/* Chart 4: Performance Metrics */}
                        <div className="lg:col-span-1 ">
                            <PerformanceMetricsCard
                                totals={statistics.totals}
                                role={currentUser?.role}
                            />
                        </div>
                       
                    </motion.div>
 {/* <motion.div variants={itemVariants} className="w-full">
                        <MessagesActivityChart
                            trendData={statistics.ticketsTrend}
                            messagesStats={statistics.messagesStats}
                        />
                    </motion.div> */}
                    {/* Row 2: Messages Activity Full Width */}
                   
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default StatsDashboard;
