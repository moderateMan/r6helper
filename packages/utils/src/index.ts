import fs from "fs";
import path from "path";
import { Spinner } from "cli-spinner";


function formatPath(p: string | undefined) {
	if (p && typeof p === "string") {
		const sep = path.sep;
		if (sep === "/") {
			return p;
		} else {
			return p.replace(/\\/g, "/");
		}
	}
	return p;
}

function isObject(o: unknown) {
	return Object.prototype.toString.call(o) === "[object Object]";
}

function spinnerStart(msg: string, spinnerString = "|/-\\") {
	const spinner = new Spinner(msg + " %s");
	spinner.setSpinnerString(spinnerString);
	spinner.start();
	return spinner;
}

function sleep(timeout = 1000) {
	return new Promise((resolve) => setTimeout(resolve, timeout));
}

function exec(command: string, args: any[], options: any) {
	const win32 = process.platform === "win32";

	const cmd = win32 ? "cmd" : command;
	const cmdArgs = win32 ? ["/c"].concat(command, args) : args;

	return require("child_process").spawn(cmd, cmdArgs, options || {});
}

function execAsync(command: string, args: any[], options: any) {
	return new Promise((resolve, reject) => {
		const p = exec(command, args, options);
		p.on("error", (e: any) => {
			reject(e);
		});
		p.on("exit", (c: any) => {
			resolve(c);
		});
	});
}

function readFile(path: string, options: any = {}) {
	if (fs.existsSync(path)) {
		const buffer = fs.readFileSync(path);
		if (buffer) {
			if (options.toJson) {
				return buffer.toJSON();
			} else {
				return buffer.toString();
			}
		}
	}
	return null;
}

function writeFile(path: string, data: any, { rewrite = true } = {}) {
	if (fs.existsSync(path)) {
		if (rewrite) {
			fs.writeFileSync(path, data);
			return true;
		}
		return false;
	} else {
		fs.writeFileSync(path, data);
		return true;
	}
}

export * from "./get-npm-info";
export { default as log } from "./log";
export { default as request } from "./request";

export {
	isObject,
	spinnerStart,
	sleep,
	exec,
	execAsync,
	readFile,
	writeFile,
	formatPath,
};
