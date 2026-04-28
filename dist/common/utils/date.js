"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIsoString = toIsoString;
function toIsoString(value) {
    return new Date(value).toISOString();
}
