"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../core/prisma"));
const loginUser = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('Invalid credentials');
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error('Invalid credentials');
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};
exports.loginUser = loginUser;
const registerUser = async (name, email, password) => {
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error('User already exists');
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.default.user.create({
        data: { name, email, password: hashedPassword }
    });
    return { userId: user.id };
};
exports.registerUser = registerUser;
