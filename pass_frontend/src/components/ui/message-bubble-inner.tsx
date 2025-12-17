import { useEffect, useRef } from "react";
import { CheckCheck, Check } from "lucide-react";
import type { Message } from "../chat/ChatRoom";
export function MessageBubbleInner({
  message,
  isOwn,
  onSeen,
}: {
  message: Message;
  isOwn: boolean;
  onSeen: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const seenSentRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seenSentRef.current) {
            seenSentRef.current = true;
            onSeen(message.id);
          }
        });
      },
      { root: null, threshold: 0.6 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [message.id, onSeen]);

  return (
    <div
      className={`mb-2 flex ${
        message.role === "agent" ? "justify-start" : "justify-end"
      }`}
    >
      <div
        ref={ref}
        className={`${
          message.role === "agent"
            ? "text-left text-foreground bg-muted  pl-8"
            : "bg-blue-600 dark:text-foreground text-background text-right pr-8"
        } inline-block max-w-[70%] rounded-lg p-2 px-4 relative`}
      >
        {message.content}
        {/* AGENT MESSAGES */}
        {message.role === "agent" && message.seen && (
          <span className="absolute  left-1 bottom-0.5 inline-flex items-center justify-center h-6 w-6 rounded-full0 text-blue-500">
            <CheckCheck className="h-4 w-4" />
          </span>
        )}
          {message.role === "agent" && !message.seen && (
          <span className="absolute  left-1 bottom-0.5 inline-flex items-center justify-center h-6 w-6 rounded-full  text-foreground">
            <Check className="h-4 w-4" />
          </span>
        )}

        {/* CLIENTS MESSAGES */}
        {message.role === "client" && message.seen && (
          <span className="absolute  right-1 bottom-0.5 inline-flex items-center justify-center h-6 w-6 rounded-full  dark:text-foreground text-background ">
            <CheckCheck className="h-4 w-4" />
          </span>
        )}

      
        {message.role === "client" && !message.seen && (
          <span className="absolute  right-1 bottom-0.5 inline-flex items-center justify-center h-6 w-6 rounded-full  dark:text-foreground text-background">
            <Check className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
