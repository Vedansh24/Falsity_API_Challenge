import { buildApp } from './app';
import { config } from './config/env';

const start = async () => {
  const app = await buildApp();

  await app.listen({ host: config.HOST, port: config.PORT });
};

start();