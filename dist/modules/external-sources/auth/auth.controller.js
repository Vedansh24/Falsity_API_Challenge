"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = exports.loginController = exports.registerController = void 0;
const auth_error_1 = require("../../../common/errors/auth-error");
const constants_1 = require("../../../config/constants");
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
    const payload = await (0, auth_service_1.loginUser)(body);
    const accessToken = request.server.jwt.sign(payload, { expiresIn: constants_1.JWT_EXPIRES_IN });
    return reply.code(200).send({
        accessToken,
        expiresIn: constants_1.JWT_EXPIRES_IN
    });
};
exports.loginController = loginController;
const meController = async (request, reply) => {
    if (request.user === undefined) {
        throw new auth_error_1.AuthError(401, 'Invalid or expired token');
    }
    const user = await (0, auth_service_1.getCurrentUser)(request.user);
    return reply.code(200).send(user);
};
exports.meController = meController;
