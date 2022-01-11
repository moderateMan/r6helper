import { useCallback } from "react";
import { getQueryVariable } from "../utils";
export interface HashsT {
	[key: string]: any;
}

export type ChangeHashsT = (hashObj: { [key: string]: any }) => void;
export type GetHashByKeyT = (variable: string) => string;

const useHash = (): {
	hashs: HashsT;
	changeHash: ChangeHashsT;
	getHashByKey: GetHashByKeyT;
} => {
	const hashs = (() => {
		const hashData: HashsT = {};
		window.location.hash
			.replace("?", "")
			.split("&")
			.forEach((item) => {
				if (item) {
					const [key, value] = item.split("=");
					hashData[key] = value;
				}
			});
		return hashData;
	})();
	function changeHashTemp(arg1: { [key: string]: any }): void {
		const hashsNew = {
			...hashs,
			...arg1,
		};
		window.location.hash =
			"?" +
			Object.entries(hashsNew)
				.map((item) => {
					return item.join("=");
				})
				.join("&");
	}
	const changeHash: ChangeHashsT = useCallback<ChangeHashsT>(changeHashTemp, [
		window.location.hash,
	]);
	const getHashByKey = useCallback((variable: string) => {
		return getQueryVariable({
			targetStr: window.location.hash.substring(1),
			variable,
			splitStr: "&",
		});
	}, []);
	return { hashs, changeHash, getHashByKey };
};

export default useHash;
