"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ButtonStatsProps {
    active?: boolean;
    onClick?: () => void;
    tooltip?: boolean;
}

const springConfig = {
    type: "spring" as const,
    stiffness: 600,
    damping: 30,
    mass: 1,
};

export function ButtonStats({ active = false, onClick, tooltip = false }: ButtonStatsProps) {
    return (
        <motion.button
            layout
            transition={springConfig}
            type="button"
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer h-7 w-7 p-0 rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-all duration-200",
                active
                    ? "bg-purple-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
            )}
            aria-label="Estatísticas"
            aria-pressed={active}
        >
            <BarChart3 className="size-4" />
        </motion.button>
    );
}

export default ButtonStats;
