"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Package = exports.Command = void 0;
var command_1 = require("./command");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return __importDefault(command_1).default; } });
var package_1 = require("./package");
Object.defineProperty(exports, "Package", { enumerable: true, get: function () { return __importDefault(package_1).default; } });
