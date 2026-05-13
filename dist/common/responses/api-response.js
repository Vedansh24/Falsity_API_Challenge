"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiResponse = createApiResponse;
function createApiResponse(data, message = 'Operation successful', meta = null) {
    return {
        success: true,
        message,
        data,
        meta,
        status: 'ok'
    };
}
