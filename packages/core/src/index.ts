// 外部依赖写在上面
import path from "path";
import userHome from "user-home";
import semver from "semver";
import colors from "colors";
import { log,getNpmSemverVersion } from "@moderate-cli/utils";
import exec from "./exec";
import commander from "commander";
// 变量
import constants from "./constants";
const pkg = require("../package.json");

const pathExistsSync = require("path-exists");
import rootCheck from "root-check";

// 创建一个Command 实例
const program: commander.Command = new commander.Command();

// 当前项目的版本号
const currentVersion = pkg.version;
async function core() {
	try {
		await prepare();
		checkEnv();
		registerCommand();
	} catch (e: any) {
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
	log.info("cli", currentVersion);
}

// 检查node版本
// 为什么检查node版本号？因为需要调用一下新版本的api
function checkNodeVersion() {
	// 第一步，获取当前mode版本
	const currentVersion = process.version;
	// 第二步，比对
	const lowestVersion = constants.LOWEST_NODE_VERSION;
	if (!semver.gte(currentVersion, lowestVersion)) {
		throw new Error(
			`moderate-cli 需要安装 v${lowestVersion}以上版本的 Nodejs`
		);
	}
}

function checkRoot() {
	// console.log("未权限降级前"+process.geteuid())
	// 需要降级，为什么？
	// 如果搞权限创建的文件，低权限都搞不了
	rootCheck();
}

// 查询主目录
function checkUsrHome() {
	console.log(userHome);
	if (!userHome || !pathExistsSync(userHome)) {
		throw new Error(colors.red("当前登陆用户主目录不存在！"));
	}
}

// 根据参数，设置log级别
function checkArgs(args: { [key: string]: any }) {
	if (args.debug) {
		process.env.CLI_DEBUG = true;
		process.env.LOG_LEVEL = "verbose";
	} else {
		process.env.LOG_LEVEL = "info";
	}
	log.level = process.env.LOG_LEVEL;
}

function checkEnv() {
	const detEnv = require("dotenv");
	const dotenvPath = path.resolve(userHome, ".env");
	if (pathExistsSync(dotenvPath)) {
		detEnv.config({
			path: dotenvPath,
		});
	}
	createDefaultConfig();
	log.verbose("环境变量", JSON.stringify(process.env.CLI_HOME_PATH));
}

function createDefaultConfig() {
	const cliConfig = {
		cliHome: "",
		home: userHome,
	};
	if (process.env.CLI_HOME) {
		cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
	} else {
		cliConfig["cliHome"] = path.join(userHome, constants.DEFAULT_CLI_HOME);
	}
	process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

async function checkGlobalUpdate() {
	// 1. 获取当前版本号
	const npmName = pkg.name;
	// 2. 调用npm API，获取所有版本号
	const versionLatest = await getNpmSemverVersion(currentVersion, npmName);
	console.log(versionLatest);
	// 如果最新版本大于当前版本
	if (versionLatest && semver.gt(versionLatest, currentVersion)) {
		log.warn(
			"warn",
			colors.yellow(`请手动更新${npmName},当前版本${currentVersion},最新版本${versionLatest}
        更新命令：npm install -g ${npmName}`)
		);
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
		.option(
			"-tp,--targetPath <targetPath>",
			"是否指定本地调试文件路径",
			""
		);

	// 初始化
	program
		.command("init")
		.alias("create")
		.argument("<projectName>", "项目名称（必填）")
		.option("-f,--force", "是否强制初始化项目")
		.action(exec);

	program.on("option:targetPath", function (this: commander.Command) {
		// 设置 targetPath
		process.env.CLI_TARGET_PATH = this.opts().targetPath;
	});

	// 开启debug模式，监听debug参数
	program.on("option:debug", function (this: commander.Command) {
		checkArgs({ debug: this.opts().debug });
	});

	// 对未知命令监听
	program.on("command:*", function (obj) {
		const availableCommands = program.commands.map((cmd) => cmd.name());
		console.log(colors.red("未知命令：" + obj[0]));
		if (availableCommands.length > 0) {
			console.log(colors.red("可用命令：" + availableCommands.join(",")));
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

export default core;
module.exports = core