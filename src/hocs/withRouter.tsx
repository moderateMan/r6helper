import React from "react";
import { useLocation, useParams, Params } from "react-router";
import type { ComponentClass, FC } from "react";
import type { Location, NavigateFunction } from "react-router";
import type { SearchsT, GetSreachByKeyT } from "../index";
import {
	ChangeHashsT,
	GetHashByKeyT,
	HashsT,
	useSearch,
	useGo,
	useHash,
} from "../index";

export interface WithRouterPropsT {
	router: {
		location: Location;
		navigate: NavigateFunction;
		params: Readonly<Params<string>>;
		searchs: SearchsT;
		getSreachByKey: GetSreachByKeyT;
		hashs: HashsT;
		getHashByKey: GetHashByKeyT;
		changeHash: ChangeHashsT;
	};
}

function withRouter(
	Comp: ComponentClass<WithRouterPropsT> | FC<WithRouterPropsT>
) {
	function ComponentWithRouterProp(props: any) {
		const location = useLocation();
		const params = useParams();
		const { searchs, getSreachByKey } = useSearch();
		const { hashs, getHashByKey, changeHash } = useHash();
		const goto = useGo();
		return (
			<Comp
				{...props}
				router={{
					location,
					navigate: goto,
					params,
					searchs,
					getSreachByKey,
					hashs,
					getHashByKey,
					changeHash,
				}}
			/>
		);
	}

	return ComponentWithRouterProp;
}

export default withRouter;
