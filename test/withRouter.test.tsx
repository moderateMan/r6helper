import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { R6Provider, withRouter, WithRouterPropsT } from "../src/index";
import useGo, { goto } from "../src/hooks/useGo";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import { isFunction } from "../src/utils/index";

describe("useGo", () => {
	beforeAll(() => {
		delete (window as any).location;
		window.location = {} as any as Location;
	});
	afterAll(() => {
		window.location = location;
	});
	it("test goto in react comp", (done) => {
		expect(isFunction(useGo)).toBe(true);
		const Page1 = withRouter(function(props: WithRouterPropsT) {
      const {router:{navigate}} = props;
			React.useEffect(() => {
				goto("/page2/1/2/3");
			});
			return <h1>Page1</h1>;
		})

		const Page2 = withRouter(function (props: WithRouterPropsT) {
			const {
				router: { location, params,navigate },
			} = props;
			React.useEffect(() => {
				expect(location.pathname).toBe("/page2/1/2/3");
				expect(params).toEqual({ id1: "1", id2: "2", id3: "3" });
        navigate({
          pathname:"/page3",
          search:"?a=1"
        })
			});
			return <h1>Page1</h1>;
		});
	 	const Page3 =  withRouter(function(props: WithRouterPropsT) {
      const {
				router: { location,searchs},
			} = props;
			React.useEffect(() => {
				expect(location.pathname).toBe("/page3");
        done();
			});
			return <h1>Page1</h1>;
		})
		TestRenderer.act(() => {
			TestRenderer.create(
				<MemoryRouter initialEntries={["/page1?the=search#the-hash"]}>
					<R6Provider>
						<Routes>
							<Route path="/page1" element={<Page1 />} />
							<Route
								path="/page2/:id1/:id2/:id3"
								element={<Page2 />}
							/>
							<Route path="/page3" element={<Page3 />} />
						</Routes>
					</R6Provider>
				</MemoryRouter>
			);
		});
	});
});
