"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const npmlog_1 = __importDefault(require("npmlog"));
npmlog_1.default.level == process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";
npmlog_1.default.heading = "moderate-cli";
npmlog_1.default.headingStyle = { bg: "blue" };
npmlog_1.default.addLevel("success", 2000, { fg: "green", bold: true });
exports.default = npmlog_1.default;
