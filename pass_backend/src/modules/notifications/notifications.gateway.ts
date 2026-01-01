import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
  },
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(`Client connected: ${client.id} (User: ${userId}, Role: ${role})`);
    }

    if (role === 'ADMIN') {
      client.join('admin_room');
    } else if (role === 'DEVELOPER') {
      client.join('developer_room');
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Generic emit to all admins
  emitToAdmins(event: string, data: any) {
    this.server.to('admin_room').emit(event, data);
  }

  // Generic emit to all developers
  emitToDevelopers(event: string, data: any) {
    this.server.to('developer_room').emit(event, data);
  }

  // Generic emit to all support (Admin + Dev)
  emitToSupport(event: string, data: any) {
    this.server.to('admin_room').to('developer_room').emit(event, data);
  }

  // Emit to a specific user
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: any) {
    return { event: 'pong', data };
  }
}
