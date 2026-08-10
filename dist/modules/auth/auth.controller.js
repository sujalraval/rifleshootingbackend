"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const auth_service_1 = require("./auth.service");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await (0, auth_service_1.loginUser)(email, password);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(401).json({ message: error.message || 'Server error' });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const data = await (0, auth_service_1.registerUser)(name, email, password);
        res.status(201).json({ message: 'User registered successfully', ...data });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Server error' });
    }
};
exports.register = register;
