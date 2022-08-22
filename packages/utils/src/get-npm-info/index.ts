import axios from "axios";
import urlJoin from "url-join";
import semver from "semver";

function getNpmInfo(npmName: string, registry?: string) {
	if (!npmName) {
		return null;
	}
	const registryUrl = registry || getDefaultRegistry();
	const npmInfoUrl = urlJoin(registryUrl, npmName);
	return axios
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

function getDefaultRegistry(isOriginal = false) {
	return isOriginal
		? "https://registry.npmjs.org"
		: "https://registry.npm.taobao.org";
}

async function getNpmVersions(npmName: string, registry?: string) {
	const data = await getNpmInfo(npmName, registry);
	if (data) {
		return Object.keys(data.versions);
	} else {
		return [];
	}
}
async function getNpmSemverVersion(
	baseVersion: string,
	npmName: string,
	registry?: string
) {
	const versions = await getNpmVersions(npmName, registry);
	const newVersions = getSemverVersions(baseVersion, versions);
	if (newVersions && newVersions.length > 0) {
		return newVersions[0];
	}
	return null;
}

// 获得npm版本信息
function getSemverVersions(baseVersion: string, versions: string[]) {
	versions = versions
		.filter((version) => semver.satisfies(version, `^${baseVersion}`))
		.sort((a, b) => {
			if (semver.gt(b, a)) {
				return 1;
			} else {
				return -1;
			}
		});
	return versions;
}
async function getNpmLatestVersion(npmName: string, registry: string) {
	let versions = await getNpmVersions(npmName, registry);
	if (versions) {
		return versions.sort((a, b) => {
			if (semver.gt(b, a)) {
				return 1;
			} else {
				return -1;
			}
		})[0];
	}
	return null;
}

export {
	getNpmInfo,
	getNpmVersions,
	getNpmSemverVersion,
	getDefaultRegistry,
	getNpmLatestVersion,
};
