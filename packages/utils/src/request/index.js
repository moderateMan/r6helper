"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = process.env.MODERATE_CLI_BASE_URL ? process.env.MODERATE_CLI_BASE_URL :
    'https://zero2one.moderate.run/api2';
const request = axios_1.default.create({
    baseURL: BASE_URL,
    timeout: 5000,
});
request.interceptors.response.use(response => {
    return response.data;
}, error => {
    return Promise.reject(error);
});
exports.default = request;
