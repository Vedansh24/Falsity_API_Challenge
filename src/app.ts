import fastify from 'fastify';

import { config } from './config/env';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';

const app = fastify({
  logger: true,
  routerOptions: {
    ignoreTrailingSlash: true
  },
  trustProxy: false
});

app.decorate('config', config);

registerPlugins(app);
registerRoutes(app);

export default app;