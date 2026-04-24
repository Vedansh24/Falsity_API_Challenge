"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
async function startServer() {
    try {
        await app_1.default.listen({ port: env_1.config.PORT, host: env_1.config.HOST });
    }
    catch (error) {
        app_1.default.log.error(error);
        process.exit(1);
    }
}
void startServer();
