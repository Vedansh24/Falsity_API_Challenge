"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = exports.loginController = exports.registerController = void 0;
const auth_schema_1 = require("./auth.schema");
const auth_service_1 = require("./auth.service");
const registerController = async (request, reply) => {
    const body = auth_schema_1.registerSchema.parse(request.body);
    const user = await (0, auth_service_1.registerUser)(body);
    return reply.code(201).send(user);
};
exports.registerController = registerController;
const loginController = async (request, reply) => {
    const body = auth_schema_1.loginSchema.parse(request.body);
    const token = await (0, auth_service_1.loginUser)(body);
    return reply.code(200).send(token);
};
exports.loginController = loginController;
const meController = async (request, reply) => {
    if (request.user === undefined) {
        return reply.code(401).send({ error: 'Invalid or expired token' });
    }
    const user = await (0, auth_service_1.getCurrentUser)(request.user);
    return reply.code(200).send(user);
};
exports.meController = meController;
