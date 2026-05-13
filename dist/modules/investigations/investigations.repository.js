"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInvestigationByClaim = findInvestigationByClaim;
exports.findInvestigationById = findInvestigationById;
exports.createInvestigation = createInvestigation;
exports.updateInvestigation = updateInvestigation;
const prisma_1 = require("../../plugins/prisma");
async function findInvestigationByClaim(claimId) {
    return (await prisma_1.prisma.investigation.findFirst({
        where: { claimId }
    }));
}
async function findInvestigationById(id) {
    return (await prisma_1.prisma.investigation.findUnique({
        where: { id }
    }));
}
async function createInvestigation(data) {
    return (await prisma_1.prisma.investigation.create({
        data: {
            claimId: data.claimId,
            investigatorId: data.investigatorId,
            status: data.status || 'ACTIVE',
            notes: data.notes,
            startedAt: data.startedAt
        }
    }));
}
async function updateInvestigation(id, data) {
    return (await prisma_1.prisma.investigation.update({
        where: { id },
        data: data
    }));
}
