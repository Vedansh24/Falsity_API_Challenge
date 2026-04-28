"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoggerOptions = createLoggerOptions;
const env_1 = require("./env");
function createLoggerOptions() {
    return {
        level: env_1.config.NODE_ENV === 'production' ? 'info' : 'debug'
    };
}
