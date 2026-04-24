"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthRoutes = registerAuthRoutes;
const authenticate_1 = require("../../middlewares/authenticate");
const auth_schema_1 = require("./auth.schema");
const auth_controller_1 = require("./auth.controller");
const registerRouteOptions = {
    schema: {
        body: auth_schema_1.registerBodyJsonSchema,
        response: {
            201: auth_schema_1.registerResponseJsonSchema
        }
    }
};
const loginRouteOptions = {
    schema: {
        body: auth_schema_1.loginBodyJsonSchema,
        response: {
            200: auth_schema_1.loginResponseJsonSchema
        }
    }
};
const meRouteOptions = {
    preHandler: authenticate_1.authenticate,
    schema: {
        response: {
            200: auth_schema_1.meResponseJsonSchema
        }
    }
};
function registerAuthRoutes(fastify) {
    fastify.register(async (instance) => {
        instance.post('/register', registerRouteOptions, auth_controller_1.registerController);
        instance.post('/login', loginRouteOptions, auth_controller_1.loginController);
        instance.get('/me', meRouteOptions, auth_controller_1.meController);
    }, { prefix: '/api/v1/auth' });
}
