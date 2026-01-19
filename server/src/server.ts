import { createServer } from 'http';
import app from './app';
import { env, testConnection, initSocket } from './config/index';

const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Start server
const start = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Cannot start server without database connection');
            process.exit(1);
        }

        httpServer.listen(env.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${env.PORT}`);
            console.log(`📡 Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

start();
