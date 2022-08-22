import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import fse from "fs-extra";
import semver from "semver";
import userHome from "user-home";
import { Command, Package } from "@moderate-cli/models";
import { log, spinnerStart, sleep, execAsync } from "@moderate-cli/utils";
import getProjectTemplate from "./getProjectTemplate";

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

const TEMPLATE_TYPE_NORMAL = "normal";
const TEMPLATE_TYPE_CUSTOM = "custom";

const WHITE_COMMAND = ["npm", "cnpm"];
interface TemplateT {
    id: string;
    installCommand: string;
    name: string;
    npmName: string;
    startCommand: string;
    tag: string[];
    type: string;
    version: string;
}

export class InitCommand extends Command {
	projectName: string = "";
	force: boolean = false;
	projectInfo: any = {};
	_cmd: any = null;
	templateInfo: any = null;
	template: TemplateT[]|null = null;
	templateNpm: Package | null = null;
	init() {
		this.projectName = this._argv[0] || "";
		this.force = !!this._cmd.force;
		log.verbose("projectName", this.projectName);
		log.verbose("force", this.force + "");
	}

	async exec() {
		try {
			// 1. 准备阶段
			const projectInfo = await this.prepare();
			if (projectInfo) {
				// 2. 下载模板
				log.verbose("projectInfo", JSON.stringify(projectInfo));
				this.projectInfo = projectInfo;
				await this.downloadTemplate();
				// 3. 安装模板
				await this.installTemplate();
			}
		} catch (e: any) {
			log.error("error", e.message);
			if (process.env.LOG_LEVEL === "verbose") {
				console.log(e);
			}
		}
	}

	async installTemplate() {
		log.verbose("templateInfo", this.templateInfo);
		if (this.templateInfo) {
			if (!this.templateInfo.type) {
				this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
			}
			if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
				// 标准安装
				await this.installNormalTemplate();
			} else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
				// 自定义安装
				await this.installCustomTemplate();
			} else {
				throw new Error("无法识别项目模板类型！");
			}
		} else {
			throw new Error("项目模板信息不存在！");
		}
	}

	checkCommand(cmd: string) {
		if (WHITE_COMMAND.includes(cmd)) {
			return cmd;
		}
		return null;
	}

	async execCommand(command: string, errMsg: string) {
		let ret;
		if (command) {
			const cmdArray = command.split(" ");
			const cmd = this.checkCommand(cmdArray[0]);
			if (!cmd) {
				throw new Error("命令不存在！命令：" + command);
			}
			const args = cmdArray.slice(1);
			ret = await execAsync(cmd, args, {
				stdio: "inherit",
				cwd: process.env.CLI_PROJECT_NAME,
			});
		}
		if (ret !== 0) {
			throw new Error(errMsg);
		}
		return ret;
	}

	async installNormalTemplate() {
		log.verbose("templateNpm", JSON.stringify(this.templateNpm));
		// 拷贝模板代码至当前目录
		let spinner = spinnerStart("正在安装模板...");
		await sleep();
		try {
			const templatePath = path.resolve(
				this.templateNpm!.cacheFilePath,
				"template"
			);
			const targetPath = process.env.CLI_PROJECT_NAME;
			fse.ensureDirSync(templatePath);
			fse.ensureDirSync(targetPath!);
			fse.copySync(templatePath, targetPath!);
		} catch (e) {
			console.log(e);
		} finally {
			spinner.stop(true);
			log.success("模板安装成功");
		}
		const { installCommand, startCommand } = this.templateInfo;
		// 依赖安装
		await this.execCommand(installCommand, "依赖安装失败！");
		// // 启动命令执行
		await this.execCommand(startCommand, "启动执行命令失败！");
	}

	async installCustomTemplate() {
		// 查询自定义模板的入口文件
		if (await this.templateNpm!.exists()) {
			let rootFile = this.templateNpm!.getRootFilePath();
			if (fs.existsSync(rootFile)) {
				log.notice("info", "开始执行自定义模板");
				const templatePath = path.resolve(
					this.templateNpm!.cacheFilePath,
					"template"
				);
				const options = {
					templateInfo: this.templateInfo,
					projectInfo: this.projectInfo,
					sourcePath: templatePath,
					targetPath: process.cwd(),
				};

				if (process.env.CLI_DEBUG) {
					rootFile =
						"/Users/johnlee/workSpace/frontEnd/cli/template/moderate-admin";
				}
				const code = `require('${rootFile}')(${JSON.stringify(
					options
				)})`;
				log.verbose("code", code);
				await execAsync("node", ["-e", code], {
					stdio: "inherit",
					cwd: process.cwd(),
				});
				log.success("自定义模板安装成功");
			} else {
				throw new Error("自定义模板入口文件不存在！");
			}
		}
	}

	async downloadTemplate() {
		const { projectTemplate } = this.projectInfo;
		const templateInfo = this.template!.find(
			(item) => item.npmName === projectTemplate
		);
		const targetPath = path.resolve(userHome, ".moderate-cli", "template");
		const storeDir = path.resolve(
			userHome,
			".moderate-cli",
			"template",
			"node_modules"
		);
		const { npmName, version } = templateInfo!;
		this.templateInfo = templateInfo;
		const templateNpm = new Package({
			targetPath,
			storeDir,
			packageName: npmName,
			packageVersion: version,
		});
		if (!(await templateNpm.exists())) {
			const spinner = spinnerStart("正在下载模板...");
			await sleep();
			try {
				await templateNpm.install();
			} catch (e) {
				throw e;
			} finally {
				spinner.stop(true);
				if (await templateNpm.exists()) {
					log.success("下载模板成功");
					this.templateNpm = templateNpm;
				}
			}
		} else {
			const spinner = spinnerStart("正在更新模板...");
			await sleep();
			try {
				await templateNpm.update();
			} catch (e) {
				throw e;
			} finally {
				spinner.stop(true);
				if (await templateNpm.exists()) {
					log.success("更新模板成功");
					this.templateNpm = templateNpm;
				}
			}
		}
	}

	async prepare() {
		// 0. 判断项目模板是否存在
		const template = await getProjectTemplate<{list:TemplateT[]}>();

		const {
			data: { list },
		} = template;

        if (!list || list.length === 0) {
			throw new Error("项目模板不存在");
		}
		this.template = list;
		// 1. 判断当前目录是否为空
		const localPath = process.env.CLI_PROJECT_NAME;
		console.log(localPath);
		if (!this.isDirEmpty(localPath!)) {
			let ifContinue = false;
			if (!this.force) {
				// 询问是否继续创建
				ifContinue = (
					await inquirer.prompt({
						type: "confirm",
						name: "ifContinue",
						default: false,
						message: "当前文件夹不为空，是否继续创建项目？",
					})
				).ifContinue;
				if (!ifContinue) {
					return;
				}
			}
			// 2. 是否启动强制更新
			if (ifContinue || this.force) {
				// 给用户做二次确认
				const { confirmDelete } = await inquirer.prompt({
					type: "confirm",
					name: "confirmDelete",
					default: false,
					message: "是否确认清空当前目录下的文件？",
				});
				if (confirmDelete) {
					// 清空当前目录
					fse.emptyDirSync(localPath!);
				}
			}
		}
		return this.getProjectInfo();
	}

	async getProjectInfo() {
		function isValidName(v:string) {
			return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
				v
			);
		}

		let projectInfo:{
            [key:string]:any
        } = {
            projectName:""
        };
		let isProjectNameValid = false;
		if (isValidName(this.projectName)) {
			isProjectNameValid = true;
			projectInfo.projectName = this.projectName;
		}
		// 1. 选择创建项目或组件
		const { type } = await inquirer.prompt({
			type: "list",
			name: "type",
			message: "moderate-cli:选择创建的类型",
			default: TYPE_PROJECT,
			choices: [
				{
					name: "项目",
					value: TYPE_PROJECT,
				},
			],
		});
		log.verbose("type", type);
		this.template = this.template!.filter((template) =>
			template.tag.includes(type)
		);
		const title = type === TYPE_PROJECT ? "项目" : "组件";
		const projectNamePrompt: {
			[key: string]: any;
			validate?: (this: any, v: any) => any;
		} = {
			type: "input",
			name: "projectName",
			message: `moderate-cli:输入${title}名称`,
			default: "",
			validate: function (v) {
				const done = this.async();
				setTimeout(function () {
					// 1.首字符必须为英文字符
					// 2.尾字符必须为英文或数字，不能为字符
					// 3.字符仅允许"-_"
					if (!isValidName(v)) {
						done(`请输入合法的${title}名称`);
						return;
					}
					done(null, true);
				}, 0);
			},
			filter: function (v:any) {
				return v;
			},
		};
		const projectPrompt: {
			[key: string]: any;
			validate?: (this: any, v: any) => any;
		}[] = [];
		if (!isProjectNameValid) {
			projectPrompt.push(projectNamePrompt);
		}
		projectPrompt.push(
			{
				type: "input",
				name: "projectVersion",
				message: `moderate-cli:确定${title}版本号`,
				default: "1.0.0",
				validate: function (v) {
					const done = this.async();
					setTimeout(function () {
						if (!!!semver.valid(v)) {
							done("请输入合法的版本号");
							return;
						}
						done(null, true);
					}, 0);
				},
				filter: function (v:any) {
					if (!!semver.valid(v)) {
						return semver.valid(v);
					} else {
						return v;
					}
				},
			},
			{
				type: "list",
				name: "projectTemplate",
				message: `moderate-cli:选择${title}模板`,
				choices: this.createTemplateChoice(),
			}
		);
		if (type === TYPE_PROJECT) {
			// 2. 获取项目的基本信息
			const project = await inquirer.prompt(projectPrompt);
			projectInfo = {
				...projectInfo,
				type,
				...project,
			};
		} else if (type === TYPE_COMPONENT) {
			const descriptionPrompt: {
                [key: string]: any;
                validate?: (this: any, v: any) => any;
            } = {
				type: "input",
				name: "componentDescription",
				message: "请输入组件描述信息",
				default: "",
				validate: function (v) {
					const done = this.async();
					setTimeout(function () {
						if (!v) {
							done("请输入组件描述信息");
							return;
						}
						done(null, true);
					}, 0);
				},
			};
			projectPrompt.push(descriptionPrompt);
			// 2. 获取组件的基本信息
			const component = await inquirer.prompt(projectPrompt);
			projectInfo = {
				...projectInfo,
				type,
				...component,
			};
		}
		// 生成classname
		if (projectInfo.projectName) {
			projectInfo.name = projectInfo.projectName;
			projectInfo.className = require("kebab-case")(
				projectInfo.projectName
			).replace(/^-/, "");
		}
		if (projectInfo.projectVersion) {
			projectInfo.version = projectInfo.projectVersion;
		}
		if (projectInfo.componentDescription) {
			projectInfo.description = projectInfo.componentDescription;
		}
		return projectInfo;
	}

	isDirEmpty(localPath:string) {
		if (fs.existsSync(localPath)) {
			let fileList = fs.readdirSync(localPath);
			// 文件过滤的逻辑
			fileList = fileList.filter(
				(file) =>
					!file.startsWith(".") && ["node_modules"].indexOf(file) < 0
			);
			return !fileList || fileList.length <= 0;
		} else {
			fse.mkdirpSync(localPath);
			return true;
		}
	}

	createTemplateChoice() {
		return this.template!.map((item) => ({
			value: item.npmName,
			name: item.name,
		}));
	}
}

export function init(argv:any) {
	return new InitCommand(argv);
}

module.exports = init

export default init;
