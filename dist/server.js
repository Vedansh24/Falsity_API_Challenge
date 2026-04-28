"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const start = async () => {
    const app = await (0, app_1.buildApp)();
    await app.listen({ host: env_1.config.HOST, port: env_1.config.PORT });
};
start();
