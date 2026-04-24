"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = require("node:path");
dotenv_1.default.config({ path: (0, node_path_1.resolve)(process.cwd(), '.env') });
if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET.trim().length === 0) {
    dotenv_1.default.config({ path: (0, node_path_1.resolve)(process.cwd(), 'src', '.env') });
}
function parsePort(value) {
    if (value === undefined || value.trim().length === 0) {
        return 3000;
    }
    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT value: ${value}. Expected an integer between 1 and 65535.`);
    }
    return port;
}
function parseHost(value) {
    if (value === undefined || value.trim().length === 0) {
        return '0.0.0.0';
    }
    return value;
}
function parseNodeEnv(value) {
    if (value === undefined || value.trim().length === 0) {
        return 'development';
    }
    if (value === 'development' || value === 'test' || value === 'production') {
        return value;
    }
    throw new Error(`Invalid NODE_ENV value: ${value}. Expected development, test, or production.`);
}
function parseJwtSecret(value) {
    if (value === undefined || value.trim().length === 0) {
        throw new Error('Missing required environment variable JWT_SECRET.');
    }
    return value;
}
exports.config = {
    PORT: parsePort(process.env.PORT),
    HOST: parseHost(process.env.HOST),
    NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
    JWT_SECRET: parseJwtSecret(process.env.JWT_SECRET)
};
