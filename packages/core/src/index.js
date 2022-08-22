"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 外部依赖写在上面
const path_1 = __importDefault(require("path"));
const user_home_1 = __importDefault(require("user-home"));
const semver_1 = __importDefault(require("semver"));
const colors_1 = __importDefault(require("colors"));
const utils_1 = require("@moderate-cli/utils");
const exec_1 = __importDefault(require("./exec"));
const commander_1 = __importDefault(require("commander"));
// 变量
const constants_1 = __importDefault(require("./constants"));
const pkg = require("../package.json");
const pathExistsSync = require("path-exists");
const root_check_1 = __importDefault(require("root-check"));
// 创建一个Command 实例
const program = new commander_1.default.Command();
// 当前项目的版本号
const currentVersion = pkg.version;
async function core() {
    try {
        await prepare();
        checkEnv();
        registerCommand();
    }
    catch (e) {
        console.log(e);
    }
}
async function prepare() {
    checkPkgVersion();
    checkRoot();
    checkNodeVersion();
    checkUsrHome();
    await checkGlobalUpdate();
}
// 检查脚手架版本号
function checkPkgVersion() {
    utils_1.log.info("cli", currentVersion);
}
// 检查node版本
// 为什么检查node版本号？因为需要调用一下新版本的api
function checkNodeVersion() {
    // 第一步，获取当前mode版本
    const currentVersion = process.version;
    // 第二步，比对
    const lowestVersion = constants_1.default.LOWEST_NODE_VERSION;
    if (!semver_1.default.gte(currentVersion, lowestVersion)) {
        throw new Error(`moderate-cli 需要安装 v${lowestVersion}以上版本的 Nodejs`);
    }
}
function checkRoot() {
    // console.log("未权限降级前"+process.geteuid())
    // 需要降级，为什么？
    // 如果搞权限创建的文件，低权限都搞不了
    (0, root_check_1.default)();
}
// 查询主目录
function checkUsrHome() {
    console.log(user_home_1.default);
    if (!user_home_1.default || !pathExistsSync(user_home_1.default)) {
        throw new Error(colors_1.default.red("当前登陆用户主目录不存在！"));
    }
}
// 根据参数，设置log级别
function checkArgs(args) {
    if (args.debug) {
        process.env.CLI_DEBUG = true;
        process.env.LOG_LEVEL = "verbose";
    }
    else {
        process.env.LOG_LEVEL = "info";
    }
    utils_1.log.level = process.env.LOG_LEVEL;
}
function checkEnv() {
    const detEnv = require("dotenv");
    const dotenvPath = path_1.default.resolve(user_home_1.default, ".env");
    if (pathExistsSync(dotenvPath)) {
        detEnv.config({
            path: dotenvPath,
        });
    }
    createDefaultConfig();
    utils_1.log.verbose("环境变量", JSON.stringify(process.env.CLI_HOME_PATH));
}
function createDefaultConfig() {
    const cliConfig = {
        cliHome: "",
        home: user_home_1.default,
    };
    if (process.env.CLI_HOME) {
        cliConfig["cliHome"] = path_1.default.join(user_home_1.default, process.env.CLI_HOME);
    }
    else {
        cliConfig["cliHome"] = path_1.default.join(user_home_1.default, constants_1.default.DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}
async function checkGlobalUpdate() {
    // 1. 获取当前版本号
    const npmName = pkg.name;
    // 2. 调用npm API，获取所有版本号
    const versionLatest = await (0, utils_1.getNpmSemverVersion)(currentVersion, npmName);
    console.log(versionLatest);
    // 如果最新版本大于当前版本
    if (versionLatest && semver_1.default.gt(versionLatest, currentVersion)) {
        utils_1.log.warn("warn", colors_1.default.yellow(`请手动更新${npmName},当前版本${currentVersion},最新版本${versionLatest}
        更新命令：npm install -g ${npmName}`));
    }
    // 3. 提取所有版本号，比对哪些版本号是大于当前版本号
}
function registerCommand() {
    console.log("registerCommand");
    program
        .name(Object.keys(pkg.bin)[0])
        .usage("<command> [options]")
        .version(pkg.version)
        .option("-d,--debug", "是否开启调试模式", false)
        .option("-tp,--targetPath <targetPath>", "是否指定本地调试文件路径", "");
    // 初始化
    program
        .command("init")
        .alias("create")
        .argument("<projectName>", "项目名称（必填）")
        .option("-f,--force", "是否强制初始化项目")
        .action(exec_1.default);
    program.on("option:targetPath", function () {
        // 设置 targetPath
        process.env.CLI_TARGET_PATH = this.opts().targetPath;
    });
    // 开启debug模式，监听debug参数
    program.on("option:debug", function () {
        checkArgs({ debug: this.opts().debug });
    });
    // 对未知命令监听
    program.on("command:*", function (obj) {
        const availableCommands = program.commands.map((cmd) => cmd.name());
        console.log(colors_1.default.red("未知命令：" + obj[0]));
        if (availableCommands.length > 0) {
            console.log(colors_1.default.red("可用命令：" + availableCommands.join(",")));
        }
    });
    program.parse(process.argv);
    console.log("registerCommand");
    if (program.args && program.args.length < 1) {
        program.outputHelp();
        console.log();
    }
}
core();
exports.default = core;
module.exports = core;
