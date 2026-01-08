"use client";

import * as React from "react";

interface CustomTooltipContentProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    colorMap?: Record<string, string>;
    labelMap?: Record<string, string>;
    dataKeys?: string[];
    valueFormatter?: (value: number) => string;
}

export function CustomTooltipContent({
    active,
    payload,
    label,
    colorMap = {},
    labelMap = {},
    dataKeys = [],
    valueFormatter = (v) => String(v),
}: CustomTooltipContentProps) {
    if (!active || !payload?.length) return null;

    return (
        <div className="border-border/50 bg-background grid min-w-[10rem] items-start gap-1.5 rounded-lg border px-3 py-2 text-xs shadow-xl">
            {label && <div className="font-medium text-foreground mb-1">{label}</div>}
            <div className="grid gap-1">
                {payload.map((entry, index) => {
                    const key = entry.dataKey || entry.name;
                    const color = colorMap[key] || entry.color || "var(--chart-1)";
                    const displayLabel = labelMap[key] || entry.name || key;

                    return (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-muted-foreground">{displayLabel}</span>
                            </div>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                                {valueFormatter(entry.value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CustomTooltipContent;
