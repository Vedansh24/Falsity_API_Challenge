"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docsRouteGroups = exports.swaggerUiOptions = exports.swaggerDocumentOptions = void 0;
const constants_1 = require("./constants");
exports.swaggerDocumentOptions = {
    openapi: {
        openapi: '3.0.3',
        info: {
            title: constants_1.APP_NAME,
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
exports.swaggerUiOptions = {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: true
    },
    staticCSP: true,
    transformSpecification: (swaggerObject) => swaggerObject,
    transformSpecificationClone: true
};
exports.docsRouteGroups = {
    apiPrefix: constants_1.API_PREFIX,
    authPrefix: constants_1.AUTH_PREFIX
};
