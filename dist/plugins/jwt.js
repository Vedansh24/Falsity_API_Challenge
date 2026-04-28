"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = __importDefault(require("@fastify/jwt"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const env_1 = require("../config/env");
const jwtPlugin = (0, fastify_plugin_1.default)(async (fastify) => {
    await fastify.register(jwt_1.default, {
        secret: env_1.config.JWT_SECRET
    });
}, {
    name: 'jwt-plugin'
});
exports.default = jwtPlugin;
