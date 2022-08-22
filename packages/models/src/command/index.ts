import semver from "semver";
import colors from "colors/safe";
import { log } from "@moderate-cli/utils";

const LOWEST_NODE_VERSION = "12.0.0";

class Command {
	_argv: any;
	_cmd: string = "";
	constructor(argv: any) {
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
				log.error("error", err.message);
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
		if (!semver.gte(currentVersion, lowestVersion)) {
			throw new Error(
				colors.red(
					`moderate-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`
				)
			);
		}
	}

	init() {
		throw new Error("init必须实现！");
	}

	exec() {
		throw new Error("exec必须实现！");
	}
}

export default Command;
