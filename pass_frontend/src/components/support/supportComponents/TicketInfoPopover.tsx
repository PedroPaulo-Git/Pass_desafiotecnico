"use client";
import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Tag,
  Calendar,
  Check,
  Copy,
  User as UserIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TicketData, Priority } from "../types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TicketInfoPopoverProps {
  children: React.ReactNode;
  data: TicketData;
  effectivePriority: Priority;
  IconComponent: React.ComponentType<any>;
  iconClass: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-muted hover:text-accent-foreground dark:bg-transparent dark:border-input dark:hover:bg-input/50 size-8 rounded-full opacity-0 group-hover:opacity-100"
    >
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out will-change-[transform,opacity,filter]",
            copied
              ? "blur-0 scale-100 opacity-100"
              : "blur-xs scale-[0.25] opacity-0"
          )}
        >
          <Check className="size-3.5" />
        </div>
        <div
          className={cn(
            "transition-[transform, opacity, filter] duration-300 ease-in-out will-change-[transform,opacity,filter]",
            copied
              ? "scale-100 opacity-0 blur-xs"
              : "scale-100 opacity-100 blur-0"
          )}
        >
          <Copy className="size-3.5" />
        </div>
      </div>
    </button>
  );
};

export const TicketInfoPopover: React.FC<TicketInfoPopoverProps> = ({
  children,
  data,
  open,
  onOpenChange,
}) => {
  const userName = data.user?.name || data.clientName;
  const userEmail = data.user?.email || "sem.email@config.com";
  const userPhone = data.user?.telefone || "+55 11 00000-0000";
  const userNationality = data.user?.nationality || "Brasil";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate =
    data.createdAt instanceof Date
      ? data.createdAt.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date(data.createdAt).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent
        className="bg-popover text-popover-foreground z-50 shadow-md outline-hidden rounded-[12px] w-[310px]! shadow-custom! dark:border border-0 p-0 dark:shadow-lg! overflow-hidden"
        align="start"
      >
        {/* Header Section */}
        <div className="flex flex-col gap-3 py-4 px-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {userName}
              </h3>
              <p className="text-[13px]! text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Details Box */}
        <div className="divide-y m-4 mt-0 rounded-lg px-4 bg-[#FAFAFA] dark:bg-[#1e1e1e]">
          {/* Email Row */}
          <div className="group flex w-full py-2.5 items-center justify-between text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <Mail className="size-4 text-muted-foreground/80 shrink-0" />
              <p className="text-[13px] font-normal text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
            <CopyButton value={userEmail} />
          </div>

          {/* Phone Row */}
          <div className="group flex w-full py-2.5 items-center justify-between text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <Phone className="size-4 text-muted-foreground/80 shrink-0" />
              <p className="text-[13px] font-normal text-muted-foreground truncate">
                {userPhone}
              </p>
            </div>
            <CopyButton value={userPhone} />
          </div>

          {/* Nationality/Location Row */}
          <div className="group flex w-full py-2.5 items-center justify-between text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <MapPin className="size-4 text-muted-foreground/80 shrink-0" />
              <p className="text-[13px] font-normal text-muted-foreground truncate">
                {userNationality}
              </p>
            </div>
            <CopyButton value={userNationality} />
          </div>

          {/* Category/Tag Row */}
          <div className="group flex w-full py-2.5 items-center justify-between text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <Tag className="size-4 text-muted-foreground/80 shrink-0" />
              <p className="text-[13px] font-normal text-muted-foreground truncate">
                {data.category}
              </p>
            </div>
            <CopyButton value={data.category as string} />
          </div>

          {/* Date Row */}
          <div className="group flex w-full py-2.5 items-center justify-between text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <Calendar className="size-4 text-muted-foreground/80 shrink-0" />
              <p className="text-[13px] font-normal text-muted-foreground truncate">
                {formattedDate}
              </p>
            </div>
            <CopyButton value={formattedDate} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
