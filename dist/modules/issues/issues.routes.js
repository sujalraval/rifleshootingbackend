"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issues_controller_1 = require("./issues.controller");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.route('/')
    .get(auth_middleware_1.protect, issues_controller_1.getAll)
    .post(auth_middleware_1.protect, issues_controller_1.create);
router.route('/:id')
    .get(auth_middleware_1.protect, issues_controller_1.getById)
    .delete(auth_middleware_1.protect, issues_controller_1.remove);
exports.default = router;
