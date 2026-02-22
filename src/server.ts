import app from './app';
import { env } from './config/env';
import { prisma } from './shared/database/prisma';
import { startScheduler } from './scheduler/scheduler';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    const PORT = parseInt(env.PORT);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
       
    });
    startScheduler();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();