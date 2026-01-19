import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.CORS_ORIGIN,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        // Join tenant room
        socket.on('join-tenant', (tenantId: string) => {
            socket.join(`tenant:${tenantId}`);
            console.log(`Socket ${socket.id} joined tenant:${tenantId}`);
        });

        // Join job room for real-time updates
        socket.on('join-job', (jobId: string) => {
            socket.join(`job:${jobId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Emit to specific tenant
export const emitToTenant = (tenantId: string, event: string, data: unknown) => {
    if (io) {
        io.to(`tenant:${tenantId}`).emit(event, data);
    }
};

// Emit to specific job room
export const emitToJob = (jobId: string, event: string, data: unknown) => {
    if (io) {
        io.to(`job:${jobId}`).emit(event, data);
    }
};
