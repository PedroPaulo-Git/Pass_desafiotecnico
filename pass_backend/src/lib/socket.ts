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
      } catch (e) {
        console.error("join error", e);
      }
    });

    socket.on("leave", ({ ticketId }) => {
      if (!ticketId) return;
      socket.leave(`ticket:${ticketId}`);
    });

    socket.on("disconnect", () => {
      // noop
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}
