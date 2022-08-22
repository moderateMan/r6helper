"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const models_1 = require("@moderate-cli/models");
const utils_1 = require("@moderate-cli/utils");
const SETTINGS = {
    init: "@moderate-cli/init",
    publish: "@moderate-cli/publish",
};
const CACHE_DIR = "dependencies";
async function main(...rest) {
    // 获得第一个参数是：项目名
    let projectName = this.args[0];
    // 根据项目名称，设置创建项目的路径
    process.env.CLI_PROJECT_NAME = path_1.default.join(process.cwd(), projectName);
    // 获得命令名字
    let name = this.name();
    // 获得通过参数设置的 targetPath
    let targetPath = process.env.CLI_TARGET_PATH;
    // 获得通过参数设置的 homePath
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = "";
    let pkg;
    utils_1.log.verbose("targetPath", targetPath + "");
    utils_1.log.verbose("homePath", homePath + "");
    const packageName = SETTINGS[name];
    const packageVersion = "latest";
    if (!targetPath) {
        targetPath = path_1.default.resolve(homePath, CACHE_DIR); // 生成缓存路径
        storeDir = path_1.default.resolve(targetPath, "node_modules");
        utils_1.log.verbose("targetPath", targetPath);
        utils_1.log.verbose("storeDir", storeDir);
        pkg = new models_1.Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion,
        });
        if (await pkg.exists()) {
            // 更新package
            await pkg.update();
        }
        else {
            // 安装package
            await pkg.install();
        }
    }
    else {
        pkg = new models_1.Package({
            targetPath,
            packageName,
            packageVersion,
        });
    }
    const rootFile = pkg.getRootFilePath();
    if (rootFile) {
        try {
            // 在当前进程中调用
            // require(rootFile).call(null, Array.from(arguments));
            // 在node子进程中调用
            const args = Object.values(rest);
            const temp = Object.create(null);
            Object.keys(this).forEach((key) => {
                if (this.hasOwnProperty(key) &&
                    !key.startsWith("_") &&
                    key !== "parent") {
                    temp[key] = this[key];
                }
            });
            args[args.length - 1] = temp;
            const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
            const child = (0, utils_1.exec)("node", ["-e", code], {
                cwd: process.cwd(),
                stdio: "inherit",
            });
            child.on("error", (e) => {
                utils_1.log.error("error", e.message);
                process.exit(1);
            });
            child.on("exit", (e) => {
                utils_1.log.verbose("info", "命令执行成功:" + e);
                process.exit(e);
            });
        }
        catch (e) {
            utils_1.log.error("error", e.message);
        }
    }
}
exports.default = main;
