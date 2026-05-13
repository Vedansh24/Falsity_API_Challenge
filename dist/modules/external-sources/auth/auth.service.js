"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
const auth_error_1 = require("../../../common/errors/auth-error");
const hashing_1 = require("../../../common/utils/hashing");
const auth_repository_1 = require("./auth.repository");
function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };
}
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
async function registerUser(input) {
    const email = normalizeEmail(input.email);
    const existingUser = await (0, auth_repository_1.findUserByEmail)(email);
    if (existingUser !== null) {
        throw new auth_error_1.AuthError(409, 'Email already registered');
    }
    const passwordHash = await (0, hashing_1.hashPassword)(input.password);
    const user = await (0, auth_repository_1.createUser)({
        name: input.name.trim(),
        email,
        passwordHash,
        role: 'USER'
    });
    return toPublicUser(user);
}
async function loginUser(input) {
    const email = normalizeEmail(input.email);
    const user = await (0, auth_repository_1.findUserByEmail)(email);
    if (user === null) {
        throw new auth_error_1.AuthError(401, 'Invalid credentials');
    }
    const passwordMatches = await (0, hashing_1.comparePassword)(input.password, user.passwordHash);
    if (!passwordMatches) {
        throw new auth_error_1.AuthError(401, 'Invalid credentials');
    }
    return {
        userId: user.id,
        role: user.role
    };
}
async function getCurrentUser(user) {
    const freshUser = await (0, auth_repository_1.findUserById)(user.userId);
    if (freshUser === null) {
        throw new auth_error_1.AuthError(404, 'User not found');
    }
    return toPublicUser(freshUser);
}
