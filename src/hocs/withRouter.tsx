import React from "react";
import type { ComponentClass, FC } from "react";
import { useGo } from "../index";
import { useLocation, useNavigate, useParams, Params } from "react-router";
import type { Location, NavigateFunction } from "react-router";
import useSearch from "../hooks/useSearch";
import type { SearchsT, ChangeSearchsT } from "../hooks/useSearch";

export interface WithRouterPropsT {
	router: {
		location: Location;
		navigate: NavigateFunction;
		params: Readonly<Params<string>>;
		searchs: SearchsT;
		changeSearch: ChangeSearchsT;
	};
}

function withRouter(
	Comp: ComponentClass<WithRouterPropsT> | FC<WithRouterPropsT>
) {
	function ComponentWithRouterProp(props: any) {
		const location = useLocation();
		const params = useParams();
		const { searchs, getSreachByKey } = useSearch();
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
				}}
			/>
		);
	}

	return ComponentWithRouterProp;
}

export default withRouter;
