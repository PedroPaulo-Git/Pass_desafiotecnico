"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "./charts-extra";
import { TicketTrend, MessageStats } from "../../types/helpdesk";
import { MessageCircle, Paperclip, TrendingUp } from "lucide-react";

interface MessagesActivityChartProps {
    trendData: TicketTrend[];
    messagesStats: MessageStats;
}

const chartConfig: ChartConfig = {
    count: {
        label: "Tickets",
        color: "hsl(270, 70%, 60%)",
    },
};

export function MessagesActivityChart({
    trendData,
    messagesStats,
}: MessagesActivityChartProps) {
    const id = useId();

    // Generate synthetic message data based on ticket trends
    const messageData = trendData.map((item, idx) => ({
        month: item.month,
        messages: Math.round(item.count * (messagesStats.avgMessagesPerTicket || 5)),
        attachments: Math.round(item.count * 1.5),
    }));

    return (
        <Card className="rounded-[20px] p-8 gap-2 border shadow-custom! bg-[linear-gradient(to_bottom,#ffffff_8%,#f3f4f6_62%,#f3f4f6_100%)] dark:bg-[linear-gradient(to_bottom,#212121_2%,#191919_22%,#191919_100%)] dark:shadow-none w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-14">
                <div className="space-y-0.5">
                    <CardTitle>Atividade de Mensagens</CardTitle>
                    <div className="flex items-start gap-2">
                        <div className="font-semibold text-2xl">{messagesStats.totalMessages} mensagens</div>
                        <Badge className="mt-1.5 bg-purple-500/24 text-purple-500 border-none">
                            {messagesStats.avgMessagesPerTicket.toFixed(1)}/ticket
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                        <MessageCircle className="size-4 text-purple-500" />
                        <div className="text-sm">
                            <span className="font-medium">{messagesStats.totalMessages}</span>
                            <span className="text-muted-foreground ml-1">msgs</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                        <Paperclip className="size-4 text-purple-400" />
                        <div className="text-sm">
                            <span className="font-medium">{messagesStats.totalAttachments}</span>
                            <span className="text-muted-foreground ml-1">anexos</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                        <TrendingUp className="size-4 text-purple-600" />
                        <div className="text-sm">
                            <span className="font-medium">{messagesStats.avgMessagesPerTicket.toFixed(1)}</span>
                            <span className="text-muted-foreground ml-1">média</span>
                        </div>
                    </div>
                </div>
            </div>

            <ChartContainer
                config={chartConfig}
                className="aspect-auto h-48 w-full"
            >
                <AreaChart
                    accessibilityLayer
                    data={messageData}
                    margin={{ left: -12, right: 12, top: 12 }}
                >
                    <defs>
                        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0.05} />
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
                                    messages: "hsl(270, 70%, 60%)",
                                    attachments: "hsl(270, 50%, 50%)",
                                }}
                                labelMap={{
                                    messages: "Mensagens",
                                    attachments: "Anexos",
                                }}
                                dataKeys={["messages", "attachments"]}
                                valueFormatter={(value: number) => `${value}`}
                            />
                        }
                    />

                    <Area
                        dataKey="messages"
                        type="monotone"
                        fill={`url(#${id}-fill)`}
                        stroke="hsl(270, 70%, 60%)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ChartContainer>
        </Card>
    );
}

export default MessagesActivityChart;
