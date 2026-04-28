"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClaim = createClaim;
exports.findById = findById;
exports.findMany = findMany;
exports.countMany = countMany;
exports.updateClaim = updateClaim;
const prisma_1 = require("../../plugins/prisma");
async function createClaim(data) {
    return prisma_1.prisma.claim.create({
        data: {
            title: data.title,
            statement: data.statement,
            submittedById: data.submittedById,
            status: 'DRAFT'
        }
    });
}
async function findById(id) {
    return prisma_1.prisma.claim.findUnique({
        where: { id }
    });
}
async function findMany(input) {
    const where = {
        ...(input.filter.status !== undefined ? { status: input.filter.status } : {}),
        ...(input.filter.submittedById !== undefined ? { submittedById: input.filter.submittedById } : {})
    };
    return prisma_1.prisma.claim.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take
    });
}
async function countMany(filter) {
    const where = {
        ...(filter.status !== undefined ? { status: filter.status } : {}),
        ...(filter.submittedById !== undefined ? { submittedById: filter.submittedById } : {})
    };
    return prisma_1.prisma.claim.count({ where });
}
async function updateClaim(id, data) {
    return prisma_1.prisma.claim.update({
        where: { id },
        data
    });
}
