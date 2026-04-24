"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const env_1 = require("./config/env");
const plugins_1 = require("./plugins");
const routes_1 = require("./routes");
const app = (0, fastify_1.default)({
    logger: true,
    routerOptions: {
        ignoreTrailingSlash: true
    },
    trustProxy: false
});
app.decorate('config', env_1.config);
(0, plugins_1.registerPlugins)(app);
(0, routes_1.registerRoutes)(app);
exports.default = app;
