import { useCallback, useMemo } from "react";
import { useLocation } from "react-router";
import { getQueryVariable } from '../utils'
export interface SearchsT {
	[key: string]: any;
}
export type ChangeSearchsT = ((data: SearchsT) => void);
export type GetSreachByKeyT = (variable: string) => string

const useSearch = (): { searchs: SearchsT; getSreachByKey: GetSreachByKeyT } => {
	const locationData = useLocation()
	const searchs = useMemo(() => {
		const searchData: SearchsT = {};
		locationData.search
			.replace("?", "")
			.split("&")
			.forEach((item) => {
				if (item) {
					const [key, value] = item.split("=");
					searchData[key] = value;
				}
			})
		return searchData;
	}, [locationData.search])

	const getSreachByKey = useCallback((searchKey: string) => {
		return getQueryVariable({
			targetStr: locationData.search.substring(1),
			variable: searchKey,
			splitStr: '&'
		})
	}, [])
	return { searchs, getSreachByKey };
};

export default useSearch;
