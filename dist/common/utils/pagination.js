"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationOffset = getPaginationOffset;
function getPaginationOffset(page, pageSize) {
    return Math.max(0, (page - 1) * pageSize);
}
