import { APP_NAME, AUTH_PREFIX, API_PREFIX } from './constants';

export const swaggerDocumentOptions = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: APP_NAME,
      version: '1.0.0'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Health', description: 'Service health checks' },
      { name: 'Auth', description: 'Authentication endpoints' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
};

export const swaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  },
  staticCSP: true,
  transformSpecification: (swaggerObject: Record<string, any>): Record<string, any> => swaggerObject,
  transformSpecificationClone: true
};

export const docsRouteGroups = {
  apiPrefix: API_PREFIX,
  authPrefix: AUTH_PREFIX
};