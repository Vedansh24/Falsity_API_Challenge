"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvidenceController = createEvidenceController;
const evidence_schema_1 = require("./evidence.schema");
const service = __importStar(require("./evidence.service"));
/**
 * Create evidence for a claim.
 * POST /api/v1/claims/:id/evidence
 */
async function createEvidenceController(request, reply) {
    try {
        // Extract claimId from route params
        const { id: claimId } = request.params;
        // Validate request body using Zod schema
        const validatedData = evidence_schema_1.createEvidenceSchema.parse(request.body);
        // Call service to add evidence
        const evidence = await service.addEvidence(claimId, validatedData);
        // Return 201 Created response
        reply.status(201).send({
            success: true,
            data: evidence
        });
    }
    catch (error) {
        // Zod validation errors or service errors will be handled by Fastify error hooks
        throw error;
    }
}
