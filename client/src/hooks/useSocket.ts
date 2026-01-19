import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);

      // Join tenant room
      if (user.tenant_id) {
        socket.emit('join-tenant', user.tenant_id);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return socketRef.current;
}

// Hook for listening to job-specific events
export function useJobSocket(jobId: string | null, onUpdate?: (data: any) => void) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !jobId) return;

    // Join job room
    socket.emit('join-job', jobId);

    // Listen for job updates
    if (onUpdate) {
      socket.on('job:updated', onUpdate);
      socket.on('task:created', onUpdate);
      socket.on('task:updated', onUpdate);
      socket.on('task:deleted', onUpdate);
    }

    // Cleanup
    return () => {
      if (onUpdate) {
        socket.off('job:updated', onUpdate);
        socket.off('task:created', onUpdate);
        socket.off('task:updated', onUpdate);
        socket.off('task:deleted', onUpdate);
      }
    };
  }, [socket, jobId, onUpdate]);

  return socket;
}

// Hook for listening to tenant-wide events
export function useTenantSocket(onJobCreated?: (data: any) => void, onJobUpdated?: (data: any) => void) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for tenant-wide events
    if (onJobCreated) {
      socket.on('job:created', onJobCreated);
    }
    if (onJobUpdated) {
      socket.on('job:updated', onJobUpdated);
    }

    // Cleanup
    return () => {
      if (onJobCreated) {
        socket.off('job:created', onJobCreated);
      }
      if (onJobUpdated) {
        socket.off('job:updated', onJobUpdated);
      }
    };
  }, [socket, onJobCreated, onJobUpdated]);

  return socket;
}
