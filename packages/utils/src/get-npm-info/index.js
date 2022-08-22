"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNpmLatestVersion = exports.getDefaultRegistry = exports.getNpmSemverVersion = exports.getNpmVersions = exports.getNpmInfo = void 0;
const axios_1 = __importDefault(require("axios"));
const url_join_1 = __importDefault(require("url-join"));
const semver_1 = __importDefault(require("semver"));
function getNpmInfo(npmName, registry) {
    if (!npmName) {
        return null;
    }
    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = (0, url_join_1.default)(registryUrl, npmName);
    return axios_1.default
        .get(npmInfoUrl)
        .then((response) => {
        if (response.status === 200) {
            return response.data;
        }
        return null;
    })
        .catch((err) => {
        return Promise.reject(err);
    });
}
exports.getNpmInfo = getNpmInfo;
function getDefaultRegistry(isOriginal = false) {
    return isOriginal
        ? "https://registry.npmjs.org"
        : "https://registry.npm.taobao.org";
}
exports.getDefaultRegistry = getDefaultRegistry;
async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry);
    if (data) {
        return Object.keys(data.versions);
    }
    else {
        return [];
    }
}
exports.getNpmVersions = getNpmVersions;
async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry);
    const newVersions = getSemverVersions(baseVersion, versions);
    if (newVersions && newVersions.length > 0) {
        return newVersions[0];
    }
    return null;
}
exports.getNpmSemverVersion = getNpmSemverVersion;
// 获得npm版本信息
function getSemverVersions(baseVersion, versions) {
    versions = versions
        .filter((version) => semver_1.default.satisfies(version, `^${baseVersion}`))
        .sort((a, b) => {
        if (semver_1.default.gt(b, a)) {
            return 1;
        }
        else {
            return -1;
        }
    });
    return versions;
}
async function getNpmLatestVersion(npmName, registry) {
    let versions = await getNpmVersions(npmName, registry);
    if (versions) {
        return versions.sort((a, b) => {
            if (semver_1.default.gt(b, a)) {
                return 1;
            }
            else {
                return -1;
            }
        })[0];
    }
    return null;
}
exports.getNpmLatestVersion = getNpmLatestVersion;
