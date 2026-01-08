"use client";

import { useId } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "./charts-extra";
import { TicketTrend, PercentageChange } from "../../types/helpdesk";

interface TicketOverviewChartProps {
    data: TicketTrend[];
    percentageChange?: PercentageChange;
    title?: string;
}

const chartConfig: ChartConfig = {
    opened: {
        label: "Abertos",
        color: "hsl(270, 70%, 60%)",
    },
    closed: {
        label: "Fechados",
        color: "hsl(270, 50%, 40%)",
    },
};

export function TicketOverviewChart({
    data,
    percentageChange,
    title = "Visão Geral de Tickets",
}: TicketOverviewChartProps) {
    const id = useId();

    const totalOpened = data.reduce((sum, item) => sum + item.opened, 0);
    const totalClosed = data.reduce((sum, item) => sum + item.closed, 0);
    const ticketChange = percentageChange?.tickets ?? 0;

    const firstMonth = data[0]?.month;
    const lastMonth = data[data.length - 1]?.month;

    return (
        <Card className="rounded-[20px] p-8 gap-2 border shadow-custom! bg-[linear-gradient(to_bottom,#ffffff_8%,#f3f4f6_62%,#f3f4f6_100%)] dark:bg-[linear-gradient(to_bottom,#212121_2%,#191919_22%,#191919_100%)] dark:shadow-none w-full h-full">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="space-y-0.5">
                    <CardTitle>{title}</CardTitle>
                    <div className="flex items-start gap-2">
                        <div className="font-semibold text-2xl">{totalOpened} tickets</div>
                        <Badge className={`mt-1.5 border-none ${ticketChange >= 0 ? 'bg-purple-500/24 text-purple-500' : 'bg-red-500/24 text-red-500'}`}>
                            {ticketChange >= 0 ? '+' : ''}{ticketChange}%
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-xs"
                            style={{ backgroundColor: "hsl(270, 70%, 60%)" }}
                        />
                        <div className="text-[13px]/3 text-muted-foreground/50">Abertos</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-xs"
                            style={{ backgroundColor: "hsl(270, 50%, 40%)" }}
                        />
                        <div className="text-[13px]/3 text-muted-foreground/50">Fechados</div>
                    </div>
                </div>
            </div>

            <ChartContainer
                config={chartConfig}
                className="aspect-auto h-60 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-purple-500/15"
            >
                <BarChart
                    accessibilityLayer
                    data={data}
                    maxBarSize={24}
                    margin={{ left: -12, right: 12, top: 12 }}
                >
                    <defs>
                        <linearGradient id={`${id}-gradient-opened`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(270, 70%, 65%)" />
                            <stop offset="100%" stopColor="hsl(270, 70%, 55%)" />
                        </linearGradient>
                        <linearGradient id={`${id}-gradient-closed`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(270, 50%, 45%)" />
                            <stop offset="100%" stopColor="hsl(270, 50%, 35%)" />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        vertical={false}
                        strokeDasharray="2 2"
                        stroke="var(--border)"
                    />

                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={12}
                        ticks={firstMonth && lastMonth ? [firstMonth, lastMonth] : undefined}
                        stroke="var(--border)"
                    />

                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => String(v)}
                    />

                    <ChartTooltip
                        content={
                            <CustomTooltipContent
                                colorMap={{
                                    opened: "hsl(270, 70%, 60%)",
                                    closed: "hsl(270, 50%, 40%)",
                                }}
                                labelMap={{
                                    opened: "Abertos",
                                    closed: "Fechados",
                                }}
                                dataKeys={["opened", "closed"]}
                                valueFormatter={(value: number) => `${value} tickets`}
                            />
                        }
                    />

                    <Bar
                        dataKey="opened"
                        fill={`url(#${id}-gradient-opened)`}
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="closed"
                        fill={`url(#${id}-gradient-closed)`}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ChartContainer>
        </Card>
    );
}

export default TicketOverviewChart;
