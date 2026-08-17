import { server } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const PORT = config.port;

server.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(`🚀 VOXA Video Chat Server is running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Client Origin: ${config.clientUrl}`);
  logger.info(`STUN Server: ${config.stunServer}`);
  logger.info(`==================================================`);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error.message);
});
