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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPath = exports.writeFile = exports.readFile = exports.execAsync = exports.exec = exports.sleep = exports.spinnerStart = exports.isObject = exports.request = exports.log = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cli_spinner_1 = require("cli-spinner");
function formatPath(p) {
    if (p && typeof p === "string") {
        const sep = path_1.default.sep;
        if (sep === "/") {
            return p;
        }
        else {
            return p.replace(/\\/g, "/");
        }
    }
    return p;
}
exports.formatPath = formatPath;
function isObject(o) {
    return Object.prototype.toString.call(o) === "[object Object]";
}
exports.isObject = isObject;
function spinnerStart(msg, spinnerString = "|/-\\") {
    const spinner = new cli_spinner_1.Spinner(msg + " %s");
    spinner.setSpinnerString(spinnerString);
    spinner.start();
    return spinner;
}
exports.spinnerStart = spinnerStart;
function sleep(timeout = 1000) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
exports.sleep = sleep;
function exec(command, args, options) {
    const win32 = process.platform === "win32";
    const cmd = win32 ? "cmd" : command;
    const cmdArgs = win32 ? ["/c"].concat(command, args) : args;
    return require("child_process").spawn(cmd, cmdArgs, options || {});
}
exports.exec = exec;
function execAsync(command, args, options) {
    return new Promise((resolve, reject) => {
        const p = exec(command, args, options);
        p.on("error", (e) => {
            reject(e);
        });
        p.on("exit", (c) => {
            resolve(c);
        });
    });
}
exports.execAsync = execAsync;
function readFile(path, options = {}) {
    if (fs_1.default.existsSync(path)) {
        const buffer = fs_1.default.readFileSync(path);
        if (buffer) {
            if (options.toJson) {
                return buffer.toJSON();
            }
            else {
                return buffer.toString();
            }
        }
    }
    return null;
}
exports.readFile = readFile;
function writeFile(path, data, { rewrite = true } = {}) {
    if (fs_1.default.existsSync(path)) {
        if (rewrite) {
            fs_1.default.writeFileSync(path, data);
            return true;
        }
        return false;
    }
    else {
        fs_1.default.writeFileSync(path, data);
        return true;
    }
}
exports.writeFile = writeFile;
__exportStar(require("./get-npm-info"), exports);
var log_1 = require("./log");
Object.defineProperty(exports, "log", { enumerable: true, get: function () { return __importDefault(log_1).default; } });
var request_1 = require("./request");
Object.defineProperty(exports, "request", { enumerable: true, get: function () { return __importDefault(request_1).default; } });
