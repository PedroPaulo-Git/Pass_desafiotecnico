"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpdeskStatus, HelpdeskPriority, HelpdeskModule } from "../../types/helpdesk";

type DistributionType = "status" | "priority" | "module";

interface Segment {
    key: string;
    name: string;
    value: number;
    percentage: number;
    color: string;
}

interface TicketDistributionChartProps {
    ticketsByStatus: Record<string, number>;
    ticketsByPriority: Record<string, number>;
    ticketsByModule: Record<string, number>;
    total: number;
}

const STATUS_COLORS: Record<string, string> = {
    ABERTO: "bg-purple-400",
    EM_ANALISE: "bg-purple-500",
    EM_ANDAMENTO: "bg-purple-600",
    AGUARDANDO_USUARIO: "bg-purple-300",
    RESOLVIDO: "bg-purple-700",
    ENCERRADO: "bg-purple-800",
};

const PRIORITY_COLORS: Record<string, string> = {
    BAIXA: "bg-purple-300",
    MEDIA: "bg-purple-500",
    ALTA: "bg-purple-700",
    CRITICA: "bg-purple-900",
};

const MODULE_COLORS: Record<string, string> = {
    AGENDAMENTO: "bg-violet-400",
    TREINAMENTOS: "bg-violet-500",
    FINANCEIRO: "bg-violet-600",
    USUARIOS: "bg-violet-700",
};

const STATUS_LABELS: Record<string, string> = {
    ABERTO: "Aberto",
    EM_ANALISE: "Em Análise",
    EM_ANDAMENTO: "Em Andamento",
    AGUARDANDO_USUARIO: "Aguardando",
    RESOLVIDO: "Resolvido",
    ENCERRADO: "Encerrado",
};

const PRIORITY_LABELS: Record<string, string> = {
    BAIXA: "Baixa",
    MEDIA: "Média",
    ALTA: "Alta",
    CRITICA: "Crítica",
};

const MODULE_LABELS: Record<string, string> = {
    AGENDAMENTO: "Agendamento",
    TREINAMENTOS: "Treinamentos",
    FINANCEIRO: "Financeiro",
    USUARIOS: "Usuários",
};

export function TicketDistributionChart({
    ticketsByStatus,
    ticketsByPriority,
    ticketsByModule,
    total,
}: TicketDistributionChartProps) {
    const [activeTab, setActiveTab] = useState<DistributionType>("status");
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const getDataForType = (type: DistributionType): Record<string, number> => {
        switch (type) {
            case "status": return ticketsByStatus;
            case "priority": return ticketsByPriority;
            case "module": return ticketsByModule;
        }
    };

    const getColorsForType = (type: DistributionType): Record<string, string> => {
        switch (type) {
            case "status": return STATUS_COLORS;
            case "priority": return PRIORITY_COLORS;
            case "module": return MODULE_COLORS;
        }
    };

    const getLabelsForType = (type: DistributionType): Record<string, string> => {
        switch (type) {
            case "status": return STATUS_LABELS;
            case "priority": return PRIORITY_LABELS;
            case "module": return MODULE_LABELS;
        }
    };

    const segments: Segment[] = useMemo(() => {
        const data = getDataForType(activeTab);
        const colors = getColorsForType(activeTab);
        const labels = getLabelsForType(activeTab);
        const totalValue = Object.values(data).reduce((sum, v) => sum + v, 0);

        return Object.entries(data)
            .filter(([_, value]) => value > 0)
            .map(([key, value]) => ({
                key,
                name: labels[key] || key,
                value,
                percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
                color: colors[key] || "bg-purple-500",
            }))
            .sort((a, b) => b.value - a.value);
    }, [activeTab, ticketsByStatus, ticketsByPriority, ticketsByModule]);

    const tabs: { key: DistributionType; label: string }[] = [
        { key: "status", label: "Status" },
        { key: "priority", label: "Prioridade" },
        { key: "module", label: "Módulo" },
    ];

    return (
        <>
            <Card className="rounded-[20px] p-8 gap-2 border border-border shadow-custom! 
            bg-[linear-gradient(to_bottom,#ffffff_8%,#f3f4f6_62%,#f3f4f6_100%)] 
            dark:bg-[linear-gradient(to_bottom,#212121_2%,#191919_22%,#191919_100%)] 
            dark:shadow-none h-full">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 ">
                    <div className="space-y-0.5">
                        <CardTitle>Distribuição de Tickets</CardTitle>
                        <div className="flex items-start gap-2">
                            <div className="font-semibold text-2xl">{total} total</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === tab.key
                                    ? "bg-purple-500 text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    {/* Horizontal bar visualization */}
                    <div className="flex gap-1 h-5 relative rounded-sm overflow-hidden">
                        {segments.map((segment) => (
                            <div
                                key={segment.key}
                                className={`${segment.color} h-full cursor-pointer transition-all duration-200 hover:opacity-80 hover:scale-y-110`}
                                style={{ width: `${segment.percentage}%` }}
                                onMouseEnter={(e) => {
                                    setHoveredSegment(segment.name);
                                    setMousePosition({ x: e.clientX, y: e.clientY });
                                }}
                                onMouseMove={(e) =>
                                    setMousePosition({ x: e.clientX, y: e.clientY })
                                }
                                onMouseLeave={() => setHoveredSegment(null)}
                                title={`${segment.name}: ${segment.value} (${segment.percentage}%)`}
                            />
                        ))}
                    </div>

                    {/* Legend list */}
                    <div>
                        <div className="text-[13px]/3 text-muted-foreground/50 mb-3">
                            Por {activeTab === "status" ? "Status" : activeTab === "priority" ? "Prioridade" : "Módulo"}
                        </div>
                        <ul className="text-sm divide-y divide-border max-h-48 overflow-y-auto">
                            {segments.map((s) => (
                                <li className="py-2 flex items-center gap-2" key={s.key}>
                                    <span
                                        className={`size-2 shrink-0 rounded-full ${s.color}`}
                                        aria-hidden="true"
                                    />
                                    <span className="grow text-muted-foreground">{s.name}</span>
                                    <span className="text-[13px]/3 font-medium text-foreground/70">
                                        {s.value} ({s.percentage}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Card>

            {hoveredSegment && (
                <div
                    className="fixed z-50 px-3 py-2 text-sm bg-popover border border-border rounded-md shadow-lg pointer-events-none"
                    style={{ left: mousePosition.x - 55, top: mousePosition.y - 65 }}
                >
                    <div className="font-medium">{hoveredSegment}</div>
                    <div className="text-muted-foreground">
                        {(() => {
                            const s = segments.find((d) => d.name === hoveredSegment);
                            if (!s) return null;
                            return `${s.value} tickets (${s.percentage}%)`;
                        })()}
                    </div>
                </div>
            )}
        </>
    );
}

export default TicketDistributionChart;
