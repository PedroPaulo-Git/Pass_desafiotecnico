import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Clock,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Navigation,
  Edit,
  Trash2,
  DollarSign,
  BusFront,
} from "lucide-react";
import { JSX, useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";

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
  const { t } = useI18n();
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    () => Object.fromEntries(routeItems.map((r) => [r.id, true]))
  );
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
          <div className="flex items-center justify-between gap-2">
            <div className="relative">
              {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
              <Input
                placeholder={`${t.common.search} ${t.tariffs.name}...`}
                className="pl-3 h-9 w-48 "
                variant="light"
              />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  className="h-9 px-2 "
                >
                  <Plus className="h-4 w-4 mt-0.5" />
                  {t.common.add}
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButtonClean={true} showCloseButton={false} className="w-xl max-w-xl rounded-xl">
                <DialogHeader >
                  <div className="flex gap-3 items-center py-2">
                    <div className="p-3 bg-background border border-muted rounded-full">
                      <DollarSign className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <DialogTitle className="flex items-center gap-2">
                        {`${t.common.add} Rota`}
                      </DialogTitle>
                      <DialogDescription>
                        Preencha os detalhes abaixo para adicionar uma nova
                        rota.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Origem
                    </label>
                    <Select>
                      <SelectTrigger className="py-2">
                        <SelectValue placeholder="Selecionar origem" />
                      </SelectTrigger>
                      <SelectContent showSearch={true}>
                        <SelectItem value="sao-paulo">São Paulo</SelectItem>
                        <SelectItem value="rio-de-janeiro">
                          Rio de Janeiro
                        </SelectItem>
                        <SelectItem value="belo-horizonte">
                          Belo Horizonte
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Destino
                    </label>
                    <Select>
                      <SelectTrigger className="py-2">
                        <SelectValue placeholder="Selecionar destino" />
                      </SelectTrigger>
                      <SelectContent showSearch={true}>
                        <SelectItem value="sao-paulo">São Paulo</SelectItem>
                        <SelectItem value="rio-de-janeiro">
                          Rio de Janeiro
                        </SelectItem>
                        <SelectItem value="belo-horizonte">
                          Belo Horizonte
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Horário
                    </label>
                    <Select>
                      <SelectTrigger className="py-2">
                        <SelectValue placeholder="Selecionar horário" />
                      </SelectTrigger>
                      <SelectContent showSearch={true}>
                        <SelectItem value="08:00">08:00</SelectItem>
                        <SelectItem value="12:00">12:00</SelectItem>
                        <SelectItem value="18:00">18:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-full justify-between gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      {t.common.cancel}
                    </Button>
                    <Button onClick={() => setDialogOpen(false)}>
                      {t.common.register}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Route Cards List */}
        <ScrollArea className="flex-1 pt-2 ">
          <div className="p-2 space-y-2">
            {routeItems.map((route, index) => (
              <div
                key={route.id}
                className={cn(
                  " rounded-lg border border-border bg-muted hover:bg-muted/50 dark:bg-card transition-colors cursor-pointer",
                  index !== 0 && "bg-card dark:bg-background hover:bg-inherit"
                )}
              >
                {/* Header with switch */}
                <div className="flex items-center justify-between mb-2 border-b py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      variant="square"
                      checked={availability[route.id] ?? true}
                      onCheckedChange={(v) =>
                        setAvailability((s) => ({ ...s, [route.id]: !!v }))
                      }
                      className="scale-100 "
                    />
                    <div className="flex items-baseline gap-2">
                      {/* <span className="text-sm font-medium">{route.title}</span> */}
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          availability[route.id] ? "" : ""
                        )}
                      >
                        {availability[route.id] ? t.status.LIBERADO : t.status.INDISPONIVEL}
                      </span>
                    </div>
                  </div>

                  <Popover
                    open={openPopover === route.id}
                    onOpenChange={(open) =>
                      setOpenPopover(open ? route.id : null)
                    }
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-sm"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[120px] bg-card border border-border p-0 px-0 pt-1 pb-1"
                      side="bottom"
                      align="end"
                      variant="custom"
                    >
                      <div className="px-2 py-1.5 font-medium text-sm mx-1 ">
                        {t.common.actions}
                      </div>
                        <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 px-2 pb-1.5 text-sm border-b rounded-none mx-1"
                        onClick={() => {
                          // Handle edit
                          setOpenPopover(null);
                        }}
                      >
                        {t.common.edit}
                      </Button>
                      <Button
                        variant="ghost_without_background_hover"
                        size="sm"
                        className="w-11/12 mx-1 justify-start h-8 px-2 mt-1 text-sm text-red-400 hover:text-red-400 hover:bg-red-400/10 cursor-default"
                        onClick={() => {
                          // Handle delete
                          setOpenPopover(null);
                        }}
                      >
                        {t.common.delete}
                      </Button>
                    </PopoverContent>
                  </Popover>
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
