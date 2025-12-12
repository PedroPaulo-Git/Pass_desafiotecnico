"use client";

import { X, Search, Plus, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Profile } from "../types";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  filteredProfiles: Profile[];
  selectedProfileId: string;
  onSelectProfile: (profileId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function ProfileModal({
  open,
  onOpenChange,
  profiles,
  filteredProfiles,
  selectedProfileId,
  onSelectProfile,
  searchTerm,
  onSearchChange,
}: ProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-screen max-w-[520px] sm:max-w-[560px] p-0 overflow-hidden rounded-xl gap-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-2">
          <div className="">
            <div className="relative">
              <Input
                variant="modal"
                placeholder="Pesquisar perfil..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 border-none py-6"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          {/* Top scroll arrow */}
          <div className="absolute -right-px top-0 w-2 h-3 flex items-center justify-center z-10 bg-background">
            <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-b-4 border-b-muted-foreground/20" />
          </div>
          
          <div
            className="h-[280px] overflow-y-scroll pr-1
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-track]:my-3
              [&::-webkit-scrollbar-thumb]:bg-muted!
              [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/80!
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-button]:h-0
              [&::-webkit-scrollbar-button]:hidden
            "
          >
            <div className="px-2 pb-2">
              {filteredProfiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectProfile(p.id);
                    onOpenChange(false);
                  }}
                  className={`w-full flex items-center justify-between cursor-pointer my-2 px-3 py-2 rounded-lg transition-colors ${
                    p.id === selectedProfileId
                      ? "bg-muted/50"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center">
                      {p.icon === "users" ? (
                        <User className="h-4 w-4" />
                      ) : p.icon === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-left flex justify-between items-center w-full">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.typeLabel}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Bottom scroll arrow */}
          <div className="absolute -right-px bottom-0 w-2 h-3 flex items-center justify-center z-10 bg-background">
            <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-4 border-t-muted-foreground/20" />
          </div>
        </div>

        {/* Add new profile footer */}
        <div className="px-7 py-3 bg-background border-t border-border flex items-center justify-center">
          <span className="w-full justify-start gap-3 flex py-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Plus className="h-6 w-6 border-border border p-1 rounded-md" />
            Adicionar Perfil
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
