import * as React from "react"
import { 
  CirclePlus, 
  Smile, 
  Paperclip, 
  Mic, 
  Send 
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSend?: (value: string) => void
  setText: (value: string) => void
}

export function ChatInput({ className, onClick,setText,onChange, onSend, ...props }: ChatInputProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const mobileRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!mobileRef.current) return;
      const target = e.target as Node | null;
      if (target && !mobileRef.current.contains(target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  return (
    <div className="bg-muted/50 relative flex items-center rounded-md  focus-within:ring-0 focus-within:ring-ring">
      <input
        {...props}
        onChange={(e) => setText(e.target.value)}
        className="flex h-14 w-full rounded-md px-4 py-2 text-base placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-[140px] lg:pr-[240px]" // Padding right garante espaço para os botões
        placeholder={props.placeholder || "Enter message..."}
      />
      
      {/* Área de Ações (Direita) */}
      <div className="absolute right-2 flex items-center gap-2">
        
        {/* Mobile: Botão de Mais (Menu) */}
        <div className="block lg:hidden relative" ref={mobileRef}>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen((v) => !v);
            }}
            aria-expanded={mobileOpen}
            aria-label="Ações"
          >
            <CirclePlus className="size-5" />
          </Button>

          {mobileOpen && (
            <div className="absolute -top-15 -right-12 flex gap-2 bg-muted p-2 rounded-md shadow-md z-50 lg:hidden ">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => {}}>
                <Smile className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => {}}>
                <Paperclip className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => {}}>
                <Mic className="size-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Desktop: Ícones de Ação */}
        <div className="hidden lg:flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground">
            <Smile className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground">
            <Paperclip className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground">
            <Mic className="size-5" />
          </Button>
        </div>

        {/* Botão Enviar */}
        <Button 
          size="sm" 
          className="h-9 px-4 ml-1"
          onClick={() => onSend?.(props.value as string)}
        >
          <span className="hidden lg:inline">Send</span>
          <Send className="lg:hidden size-4" />
          <Send className="hidden lg:inline size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}