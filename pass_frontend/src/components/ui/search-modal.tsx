import { Dialog, DialogContent, DialogTitle, DialogClose } from "./dialog";
import {
  LayoutDashboard,
  Activity,
  BusFront,
  Package,
  BedDouble,
  Ticket,
  DollarSign,
  CalendarDays,
  Puzzle,
  MapPin,
  Camera,
  Settings,
  Search,
  XIcon,
} from "lucide-react";
import { Input } from "./input";

interface SearchModalProps {
  openSearchDialog: boolean;
  setOpenSearchDialog: (open: boolean) => void;
}

export function SearchModal({
  openSearchDialog,
  setOpenSearchDialog,
}: SearchModalProps) {
  return (
    <>
      <Dialog open={openSearchDialog} onOpenChange={setOpenSearchDialog}>
        <DialogContent
          showCloseButton={false}
          className="w-[480px] sm:w-[520px] 
          p-0 rounded-xl space-y-0  gap-0"
        >
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
            <Input
              variant="modal"
              placeholder="Digite um comando ou pesquise..."
              className="h-12 rounded-none border-t-0 border-x-0 pl-9 pr-14 text-sm shadow-none focus-visible:ring-1"
            />
            <XIcon
              className="absolute right-3.5 top-4 h-4 w-4 text-foreground cursor-pointer"
              onClick={() => setOpenSearchDialog(false)}
            />
          </div>

          <div
            className="pt-2 max-h-[34vh] overflow-auto ]
            overflow-y-scroll 

              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-track]:my-3
              [&::-webkit-scrollbar-thumb]:bg-muted!
              [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/80!
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-button]:h-0
              [&::-webkit-scrollbar-button]:hidden"
          >
            <div className="absolute top-12 border-r -right-px w-2 h-3 flex items-center justify-center z-10 bg-background">
              <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-b-4 border-b-muted-foreground/20" />
            </div>

            {/* Replicate sidebar nav groups */}
            <div className="space-y-4 ">
              <div className="border-b px-2 py-2">
                <div className="mb-2 pl-3 text-xs font-bold text-muted-foreground">
                  Main
                </div>
                <div className="space-y-1 ">
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Panel</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <Activity className="h-4 w-4" />
                    <span>Activity</span>
                  </button>
                </div>
              </div>

              <div className="border-b px-2 py-2">
                <div className="mb-2 pl-3  text-xs font-bold text-muted-foreground">
                  Services
                </div>
                <div className="space-y-1">
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <BusFront className="h-4 w-4" />
                    <span>Transfer</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <Package className="h-4 w-4" />
                    <span>Combo</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <BedDouble className="h-4 w-4" />
                    <span>Accommodation</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <Ticket className="h-4 w-4" />
                    <span>Ticket</span>
                  </button>
                </div>
              </div>

              <div className="border-b px-2 py-2">
                <div className="mb-2 pl-3 text-xs font-bold text-muted-foreground">
                  Commercial
                </div>
                <div className="space-y-1">
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <DollarSign className="h-4 w-4" />
                    <span>Tariff</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <CalendarDays className="h-4 w-4" />
                    <span>Availability</span>
                  </button>
                </div>
              </div>

              <div className="border-b px-2 py-2">
                <div className="mb-2 pl-3  text-xs font-bold text-muted-foreground">
                  Complements
                </div>
                <div className="space-y-1">
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <Puzzle className="h-4 w-4" />
                    <span>Slots</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <MapPin className="h-4 w-4" />
                    <span>Perimeters</span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <Camera className="h-4 w-4" />
                    <span>Tour</span>
                  </button>
                </div>
              </div>

              <div className="px-2 py-2">
                <div className="mb-2 pl-3 text-xs font-bold text-muted-foreground">
                  Organization
                </div>
                <div className="space-y-1">
                  <button className="flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-left text-[13px] font-medium hover:bg-accent">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute  -right-px bottom-0 w-2 h-3 flex items-center justify-center z-10 ">
              <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-4 border-t-muted-foreground/20" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
