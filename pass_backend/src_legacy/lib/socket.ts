import { Server as IOServer } from "socket.io";
import type http from "http";

let io: IOServer | null = null;

export function initSocket(server: http.Server) {
  if (io) return io;
  io = new IOServer(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);

    socket.on("join", ({ ticketId, uuid, role }) => {
      try {
        if (!ticketId) return;
        const room = `ticket:${ticketId}`;
        socket.join(room);
        // agents can also join an agents room to receive ticket list updates
        if (role === "agent") socket.join("agents");
        console.log(`${socket.id} joined ${room}`);
        // notify room that a user joined
        try {
          io?.to(room).emit("user:joined", { ticketId, uuid, role });
        } catch (e) {
          /* ignore */
        }
      } catch (e) {
        console.error("join error", e);
      }
    });

    socket.on("leave", ({ ticketId, uuid }) => {
      if (!ticketId) return;
      const room = `ticket:${ticketId}`;
      socket.leave(room);
      try {
        io?.to(room).emit("user:left", { ticketId, uuid });
      } catch (e) {
        /* ignore */
      }
    });

    socket.on("disconnect", () => {
      // Notify rooms that this socket left (best-effort)
      try {
        const rooms = Array.from(socket.rooms || []);
        rooms.forEach((r) => {
          if (r.startsWith("ticket:")) {
            io?.to(r).emit("user:left", { ticketId: r.split(":")[1] });
          }
        });
      } catch (e) {
        /* ignore */
      }
    });

    socket.on("message:seen", ({ ticketId, messageId, uuid }) => {
      try {
        if (!ticketId || !messageId) return;
        const room = `ticket:${ticketId}`;
        io?.to(room).emit("message:seen", { messageId, uuid });
      } catch (e) {
        console.error("message:seen error", e);
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}
