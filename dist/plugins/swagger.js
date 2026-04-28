"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSwagger = registerSwagger;
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const docs_1 = require("../config/docs");
async function registerSwagger(fastify) {
    await fastify.register(swagger_1.default, docs_1.swaggerDocumentOptions);
    await fastify.register(swagger_ui_1.default, docs_1.swaggerUiOptions);
}
