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
exports.remove = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const service = __importStar(require("./payments.service"));
const payments_schema_1 = require("./payments.schema");
const getAll = async (req, res) => {
    try {
        const data = await service.findAll();
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getAll = getAll;
const getById = async (req, res) => {
    try {
        const data = await service.findById(req.params.id);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getById = getById;
const create = async (req, res) => {
    try {
        const validatedData = payments_schema_1.createSchema.parse(req.body);
        const data = await service.create(validatedData);
        res.status(201).json({ message: 'Record created successfully', data });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const validatedData = payments_schema_1.updateSchema.parse(req.body);
        const data = await service.update(req.params.id, validatedData);
        res.status(200).json({ message: 'Record updated successfully', data });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        await service.remove(req.params.id);
        res.status(200).json({ message: 'Record deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.remove = remove;
