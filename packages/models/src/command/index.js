"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = __importDefault(require("semver"));
const safe_1 = __importDefault(require("colors/safe"));
const utils_1 = require("@moderate-cli/utils");
const LOWEST_NODE_VERSION = "12.0.0";
class Command {
    constructor(argv) {
        this._cmd = "";
        // log.verbose('Command constructor', argv);
        if (!argv) {
            throw new Error("参数不能为空！");
        }
        if (!Array.isArray(argv)) {
            throw new Error("参数必须为数组！");
        }
        if (argv.length < 1) {
            throw new Error("参数列表为空！");
        }
        this._argv = argv;
        new Promise(() => {
            let chain = Promise.resolve();
            chain = chain.then(() => this.checkNodeVersion());
            chain = chain.then(() => this.initArgs());
            chain = chain.then(() => this.init());
            chain = chain.then(() => this.exec());
            chain.catch((err) => {
                utils_1.log.error("error", err.message);
            });
        });
    }
    initArgs() {
        this._cmd = this._argv[this._argv.length - 1];
        this._argv = this._argv.slice(0, this._argv.length - 1);
    }
    checkNodeVersion() {
        const currentVersion = process.version;
        const lowestVersion = LOWEST_NODE_VERSION;
        if (!semver_1.default.gte(currentVersion, lowestVersion)) {
            throw new Error(safe_1.default.red(`moderate-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`));
        }
    }
    init() {
        throw new Error("init必须实现！");
    }
    exec() {
        throw new Error("exec必须实现！");
    }
}
exports.default = Command;
