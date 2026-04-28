"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginatedResponse = createPaginatedResponse;
function createPaginatedResponse(input) {
    return {
        items: input.items,
        page: input.page,
        pageSize: input.pageSize,
        total: input.total,
        totalPages: Math.max(1, Math.ceil(input.total / input.pageSize))
    };
}
