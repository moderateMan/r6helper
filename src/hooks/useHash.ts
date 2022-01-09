import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getQueryVariable } from '../utils'
export interface HashsT {
	[key: string]: any;
}

export type ChangeHashsT = ((hashObj: { [key: string]: any }) => void);
export type GetHashByKeyT = (variable: string) => string

const useHash = (): { hashs: HashsT; changeHash: ChangeHashsT, getHashByKey: GetHashByKeyT } => {
	const locationData = useLocation()
	const hashs = useMemo(() => {
		console.log('useMemo')
		const hashData: HashsT = {};
		locationData.hash.substring(1)
			.replace("?", "")
			.split("&")
			.forEach((item) => {
				if (item) {
					const [key, value] = item.split("=");
					hashData[key] = value;
				}
			})
		return hashData
	}, [locationData.hash])
	function changeHashTemp(arg1: { [key: string]: any }): void {
		const hashsNew = {
			...hashs,
			...arg1
		};
		window.location.hash =
			"?" +
			Object.entries(hashsNew)
				.map((item) => {
					return item.join("=");
				})
				.join("&");
	}
	const changeHash: ChangeHashsT = useCallback<ChangeHashsT>(changeHashTemp, [locationData.hash])
	const getHashByKey = useCallback((variable: string) => {
		return getQueryVariable({
			targetStr: locationData.hash.substring(1),
			variable,
			splitStr: '&'
		})
	}, [])
	return { hashs, changeHash, getHashByKey };
};

export default useHash;
