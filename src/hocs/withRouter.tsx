import React from "react";
import type { ComponentClass, FC } from "react";
import { useLocation, useNavigate, useParams, Params } from "react-router-dom";
import type { Location, NavigateFunction } from "react-router-dom";
import useSearch from "../hooks/useSearch";
import type { SearchsT, ChangeSearchsT } from "../hooks/useSearch";

export interface WithRouterPropsT {
  router: {
    location: Location;
    navigate: NavigateFunction;
    params: Readonly<Params<string>>;
    searchs: SearchsT;
    changeSearch: ChangeSearchsT;
  }
}

function withRouter(Comp: ComponentClass<WithRouterPropsT> | FC<WithRouterPropsT>) {
  function ComponentWithRouterProp(props: any) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const { searchs, getSreachByKey } = useSearch();
    return (
      <Comp
        {...props}
        router={{ location, navigate, params, searchs, getSreachByKey }}
      />
    );
  }

  return ComponentWithRouterProp;
}

export default withRouter;
