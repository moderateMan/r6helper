"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const pkg_dir_1 = require("pkg-dir");
const path_exists_1 = require("path-exists");
const npminstall = require("npminstall");
const { isObject, formatPath, getNpmLatestVersion, getDefaultRegistry, } = require("@moderate-cli/utils");
class Package {
    constructor(options) {
        this.targetPath = "";
        this.storeDir = "";
        this.packageName = "";
        this.packageVersion = "";
        this.cacheFilePathPrefix = "";
        if (!options) {
            throw new Error("Package类的options参数不能为空！");
        }
        if (!isObject(options)) {
            throw new Error("Package类的options参数必须为对象！");
        }
        // package的目标路径
        this.targetPath = options.targetPath;
        // 缓存package的路径
        this.storeDir = options.storeDir;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
        // package的缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace("/", "_");
    }
    async prepare() {
        if (this.storeDir && !(0, path_exists_1.sync)(this.storeDir)) {
            fs_extra_1.default.mkdirpSync(this.storeDir);
        }
        if (this.packageVersion === "latest") {
            this.packageVersion = await getNpmLatestVersion(this.packageName);
        }
    }
    get cacheFilePath() {
        return path_1.default.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
    }
    getSpecificCacheFilePath(packageVersion) {
        return path_1.default.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
    }
    // 判断当前Package是否存在
    async exists() {
        if (this.storeDir) {
            await this.prepare();
            return (0, path_exists_1.sync)(this.cacheFilePath);
        }
        else {
            return (0, path_exists_1.sync)(this.targetPath);
        }
    }
    // 安装Package
    async install() {
        await this.prepare();
        return npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [
                {
                    name: this.packageName,
                    version: this.packageVersion,
                },
            ],
        });
    }
    // 更新Package
    async update() {
        await this.prepare();
        // 1. 获取最新的npm模块版本号
        const latestPackageVersion = await getNpmLatestVersion(this.packageName);
        // 2. 查询最新版本号对应的路径是否存在
        const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
        // 3. 如果不存在，则直接安装最新版本
        if (!(0, path_exists_1.sync)(latestFilePath)) {
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [
                    {
                        name: this.packageName,
                        version: latestPackageVersion,
                    },
                ],
            });
            this.packageVersion = latestPackageVersion;
        }
        else {
            this.packageVersion = latestPackageVersion;
        }
    }
    // 获取入口文件的路径
    getRootFilePath() {
        function _getRootFile(targetPath) {
            // 1. 获取package.json所在目录
            const dir = (0, pkg_dir_1.sync)(targetPath);
            if (dir) {
                // 2. 读取package.json
                const pkgFile = require(path_1.default.resolve(dir, "package.json"));
                // 3. 寻找main/lib
                if (pkgFile && pkgFile.main) {
                    // 4. 路径的兼容(macOS/windows)
                    return formatPath(path_1.default.resolve(dir, pkgFile.main));
                }
            }
            return null;
        }
        if (this.storeDir) {
            return _getRootFile(this.cacheFilePath);
        }
        else {
            return _getRootFile(this.targetPath + "/" + this.packageName);
        }
    }
}
exports.default = Package;
