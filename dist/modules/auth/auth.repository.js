"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
const prisma_1 = require("../../plugins/prisma");
async function createUser(data) {
    return prisma_1.prisma.user.create({
        data
    });
}
async function findUserByEmail(email) {
    return prisma_1.prisma.user.findUnique({
        where: {
            email
        }
    });
}
async function findUserById(id) {
    return prisma_1.prisma.user.findUnique({
        where: {
            id
        }
    });
}
