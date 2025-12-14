import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Clock,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Navigation,
} from "lucide-react";
import { JSX } from "react";

export interface RouteItem {
  id: string;
  title: string;
  origin: string;
  destination: string;
  schedule: string;
  badge?: string;
}
export interface SidebarTasksProps {
  ratesSidebarOpen: boolean;
  routeItems: RouteItem[];
  setRatesSidebarOpen: (open: boolean) => void;
}

export function SidebarTasks({
  ratesSidebarOpen,
  routeItems,
  setRatesSidebarOpen,
}: SidebarTasksProps): JSX.Element {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 h-full  bg-background transition-all duration-300 ease-in-out overflow-hidden z-50",
        ratesSidebarOpen ? "w-[340px] " : "w-0"
      )}
    >
      <div className="flex flex-col h-full w-[340px]  border rounded-tl-2xl">
        {/* Search Header */}
        <div className="p-3  py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar tarifa..."
                className="pl-4 h-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              type="button"
              size="sm"
              className="h-8 px-2 "
            >
              <Plus className="h-4 w-4 mt-0.5" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Route Cards List */}
        <ScrollArea className="flex-1 pt-2 ">
          <div className="p-2 space-y-2">
            {routeItems.map((route, index) => (
              <div
                key={route.id}
                className={cn(
                  " rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                  index !== 0 && "bg-background hover:bg-inherit"
                )}
              >
                {/* Header with switch */}
                <div className="flex items-center justify-between mb-2 border-b py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      variant="square"
                      defaultChecked
                      className="scale-100 "
                    />
                    <span className="text-sm font-medium">{route.title}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-sm"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>

                {/* Route info */}
                <div className="space-y-1.5 text-sm px-2">
                  <div className="flex items-center gap-1.5 border-b pb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    
                    <span className="text-foreground line-clamp-1">
                      {route.origin}
                    </span>
                    {route.badge && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 p-1.5 py-2 border border-border ml-auto"
                      >
                        {route.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 border-b pb-3">
                    <Navigation className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-foreground line-clamp-1">
                      {route.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pb-3">
                    <Clock className="h-4 w-4  text-muted-foreground shrink-0" />
                    
                    <span className="text-foreground">{route.schedule}</span>
                  </div>
                </div>
              </div>
            ))}


          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
