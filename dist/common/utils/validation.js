"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatZodErrors = formatZodErrors;
const zod_1 = require("zod");
function formatZodErrors(error) {
    if (error instanceof zod_1.ZodError) {
        return error.issues.map(e => ({ path: Array.isArray(e.path) ? e.path.join('.') : String(e.path), message: e.message }));
    }
    // Fallback: unknown validation shape
    return [];
}
