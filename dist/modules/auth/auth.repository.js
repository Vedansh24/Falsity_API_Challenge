"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createUser(data) {
    return prisma.user.create({
        data
    });
}
async function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: {
            email
        }
    });
}
async function findUserById(id) {
    return prisma.user.findUnique({
        where: {
            id
        }
    });
}
