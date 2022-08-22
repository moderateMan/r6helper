import path from "path";
import { Package } from "@moderate-cli/models";
import { log,exec } from "@moderate-cli/utils";

const SETTINGS = {
	init: "@moderate-cli/init",
	publish: "@moderate-cli/publish",
};

const CACHE_DIR = "dependencies";

async function main(this: any, ...rest: any) {
	// 获得第一个参数是：项目名
	let projectName = this.args[0];
	// 根据项目名称，设置创建项目的路径
	process.env.CLI_PROJECT_NAME = path.join(process.cwd(), projectName);
	// 获得命令名字
	let name: string = this.name();
	// 获得通过参数设置的 targetPath
	let targetPath = process.env.CLI_TARGET_PATH;
	// 获得通过参数设置的 homePath
	const homePath = process.env.CLI_HOME_PATH;
	let storeDir = "";
	let pkg;
	log.verbose("targetPath", targetPath + "");
	log.verbose("homePath", homePath + "");

	const packageName = SETTINGS[name as keyof typeof SETTINGS];
	const packageVersion = "latest";

	if (!targetPath) {
		targetPath = path.resolve(homePath!, CACHE_DIR); // 生成缓存路径
		storeDir = path.resolve(targetPath, "node_modules");
		log.verbose("targetPath", targetPath);
		log.verbose("storeDir", storeDir);
		pkg = new Package({
			targetPath,
			storeDir,
			packageName,
			packageVersion,
		});
		if (await pkg.exists()) {
			// 更新package
			await pkg.update();
		} else {
			// 安装package
			await pkg.install();
		}
	} else {
		pkg = new Package({
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
				if (
					this.hasOwnProperty(key) &&
					!key.startsWith("_") &&
					key !== "parent"
				) {
					temp[key] = this[key];
				}
			});
			args[args.length - 1] = temp;
			const code = `require('${rootFile}').call(null, ${JSON.stringify(
				args
			)})`;
			const child = exec("node", ["-e", code], {
				cwd: process.cwd(),
				stdio: "inherit",
			});
			child.on("error", (e: any) => {
				log.error("error",e.message);
				process.exit(1);
			});
			child.on("exit", (e: any) => {
				log.verbose("info","命令执行成功:" + e);
				process.exit(e);
			});
		} catch (e: any) {
			log.error("error",e.message);
		}
	}
}

export default main;
