"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiResponse = createApiResponse;
function createApiResponse(data) {
    return {
        status: 'ok',
        data
    };
}
