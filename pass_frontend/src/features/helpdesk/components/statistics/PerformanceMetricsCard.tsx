"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { StatsTotals } from "../../types/helpdesk";
import {
    Ticket,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    TrendingUp
} from "lucide-react";

interface PerformanceMetricsCardProps {
    totals: StatsTotals;
    role?: string;
}

interface MetricItemProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    iconBg?: string;
}

function MetricItem({ icon, label, value, subtext, iconBg = "bg-purple-500/20" }: MetricItemProps) {
    return (
        <div className="flex items-center gap-2 py-1.5">
            <div className={`p-1.5 xl:p-2 rounded-md ${iconBg} shrink-0`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                    <div className="text-[10px] xl:text-xs text-muted-foreground leading-tight">{label}</div>
                    <div className="font-semibold text-sm xl:text-sm leading-tight">{value}</div>
                </div>
                {subtext && (
                    <span className="text-[10px] xl:text-xs text-muted-foreground/70 ml-2 shrink-0">{subtext}</span>
                )}
            </div>
        </div>
    );
}

export function PerformanceMetricsCard({ totals, role }: PerformanceMetricsCardProps) {
    const resolutionRate = totals.total > 0
        ? Math.round(((totals.resolved + totals.closed) / totals.total) * 100)
        : 0;

    const openRate = totals.total > 0
        ? Math.round((totals.open / totals.total) * 100)
        : 0;

    const inProgressRate = totals.total > 0
        ? Math.round((totals.inProgress / totals.total) * 100)
        : 0;

    const resolvedRate = totals.total > 0
        ? Math.round((totals.resolved / totals.total) * 100)
        : 0;

    const closedRate = totals.total > 0
        ? Math.round((totals.closed / totals.total) * 100)
        : 0;

    const roleLabel = role === "ADMIN"
        ? "Visão Administrador"
        : role === "DEVELOPER"
            ? "Tickets Atribuídos"
            : "Meus Tickets";

    return (
        <Card className="rounded-[20px] p-4 gap-0 border shadow-custom! 
        bg-[linear-gradient(to_bottom,#ffffff_8%,#f3f4f6_62%,#f3f4f6_100%)]
         dark:bg-[linear-gradient(to_bottom,#212121_2%,#191919_22%,#191919_100%)] dark:shadow-none h-full flex flex-col">

            {/* Header */}
            {/* <div className="pb-2 mb-1 border-b border-border/50">
                <CardTitle className="text-sm">Métricas</CardTitle>
                <div className="text-[10px] text-muted-foreground">{roleLabel}</div>
            </div> */}

            {/* Metrics Grid - Compact */}
            <div className="flex-1 flex flex-col justify-between divide-y divide-border/30">
                <MetricItem
                    icon={<Ticket className="size-3 xl:size-4 text-purple-500" />}
                    label="Total"
                    value={totals.total}
                    iconBg="bg-purple-500/15"
                />

                <MetricItem
                    icon={<Clock className="size-3 xl:size-4 text-purple-400" />}
                    label="Abertos"
                    value={totals.open}
                    subtext={`${openRate}%`}
                    iconBg="bg-purple-400/15"
                />

                <MetricItem
                    icon={<Loader2 className="size-3 xl:size-4 text-purple-600" />}
                    label="Andamento"
                    value={totals.inProgress}
                    subtext={`${inProgressRate}%`}
                    iconBg="bg-purple-600/15"
                />

                <MetricItem
                    icon={<CheckCircle2 className="size-3 xl:size-4 text-green-500" />}
                    label="Resolvidos"
                    value={totals.resolved}
                    subtext={`${resolvedRate}%`}
                    iconBg="bg-green-500/15"
                />

                <MetricItem
                    icon={<XCircle className="size-3 xl:size-4 text-slate-500" />}
                    label="Encerrados"
                    value={totals.closed}
                    subtext={`${closedRate}%`}
                    iconBg="bg-slate-500/15"
                />
            </div>

            {/* Resolution Rate Bar */}
            <div className="pt-2 mt-2 border-t border-border/50">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="size-3 text-purple-500" />
                        <span className="text-xs text-muted-foreground">Resolução</span>
                    </div>
                    <span className="text-xs font-bold text-purple-500">{resolutionRate}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${resolutionRate}%` }}
                    />
                </div>
            </div>
        </Card>
    );
}

export default PerformanceMetricsCard;
