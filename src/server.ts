import app from './app';
import { config } from './config/env';

async function startServer(): Promise<void> {
  try {
    await app.listen({ port: config.PORT, host: config.HOST });
  } catch (error: unknown) {
    app.log.error(error);
    process.exit(1);
  }
}

void startServer();