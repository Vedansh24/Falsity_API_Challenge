"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServiceError = void 0;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../../lib/jwt");
const auth_repository_1 = require("./auth.repository");
class AuthServiceError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.name = 'AuthServiceError';
        this.statusCode = statusCode;
    }
}
exports.AuthServiceError = AuthServiceError;
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
        throw new AuthServiceError(409, 'Email already registered');
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, 12);
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
        throw new AuthServiceError(401, 'Invalid credentials');
    }
    const passwordMatches = await bcrypt_1.default.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
        throw new AuthServiceError(401, 'Invalid credentials');
    }
    const accessToken = (0, jwt_1.signToken)({
        userId: user.id,
        role: user.role
    });
    return {
        accessToken,
        expiresIn: '1d'
    };
}
async function getCurrentUser(user) {
    const freshUser = await (0, auth_repository_1.findUserById)(user.userId);
    if (freshUser === null) {
        throw new AuthServiceError(404, 'User not found');
    }
    return toPublicUser(freshUser);
}
