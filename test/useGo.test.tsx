import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { R6Provider } from "../src/index";
import useGo, { goto } from "../src/hooks/useGo";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import { isFunction } from "../src/utils/index";

describe("useGo", () => {
	it("test goto in react comp", (done) => {
		expect(isFunction(useGo)).toBe(true);
		function Page1() {
			const goto = useGo();
			React.useEffect(() => {
				goto("/page2");
			});
			return <h1>Page1</h1>;
		}

		function Page2() {
			const location = useLocation();
			React.useEffect(() => {
				expect(location.pathname).toBe("/page2");
				anyWhere();
			});
			return <h1>Page1</h1>;
		}
		function Page3() {
			const location = useLocation();
			React.useEffect(() => {
				expect(location.pathname).toBe("/page3");
				done();
			});
			return <h1>Page1</h1>;
		}

		function anyWhere() {
			goto("/page3?a=1");
		}

		TestRenderer.act(() => {
			TestRenderer.create(
				<MemoryRouter initialEntries={["/page1?the=search#the-hash"]}>
					<R6Provider>
						<Routes>
							<Route path="/page1" element={<Page1 />} />
							<Route path="/page2" element={<Page2 />} />
							<Route path="/page3" element={<Page3 />} />
						</Routes>
					</R6Provider>
				</MemoryRouter>
			);
		});
	});
});
