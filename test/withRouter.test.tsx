import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import {
	R6Provider,
	withRouter,
	WithRouterPropsT,
	useGo,
	goto,
} from "../src/index";
import { MemoryRouter, Routes, Route } from "react-router";
import { isFunction } from "../src/utils/index";

describe("withRouter", () => {
	it("test withRouter", (done) => {
		expect(isFunction(useGo)).toBe(true);
		const Page1 = withRouter(function (props: WithRouterPropsT) {
			const {
				router: { location },
			} = props;
			React.useEffect(() => {
				expect(location.pathname).toBe("/page1");
				goto("/page2/1/2/3");
			});
			return <h1>Page1</h1>;
		});

		const Page2 = withRouter(function (props: WithRouterPropsT) {
			const {
				router: { location, params },
			} = props;
			React.useEffect(() => {
				expect(location.pathname).toBe("/page2/1/2/3");
				expect(params).toEqual({ id1: "1", id2: "2", id3: "3" });
				goto("page123?a=1");
			});
			return <h1>Page1</h1>;
		});
		const Page3 = withRouter(function (props: WithRouterPropsT) {
			const {
				router: { searchs },
			} = props;
			React.useEffect(() => {
				expect(searchs).toEqual({ a: "1" });
				done();
			});
			return <h1>Page3</h1>;
		});
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
							<Route path="/page123" element={<Page3 />} />
						</Routes>
					</R6Provider>
				</MemoryRouter>
			);
		});
	});
});
