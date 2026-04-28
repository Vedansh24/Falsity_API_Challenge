"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const constants_1 = require("../../config/constants");
function hashPassword(password) {
    return bcrypt_1.default.hash(password, constants_1.BCRYPT_SALT_ROUNDS);
}
function comparePassword(password, passwordHash) {
    return bcrypt_1.default.compare(password, passwordHash);
}
