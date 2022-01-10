import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { MemoryRouter, Routes, Route } from "react-router";
import { useSearch } from "../src/index";
import { isFunction } from "../src/utils/index";

describe("useSearch", () => {
	beforeAll(() => {
		delete (window as any).location;
		window.location = { hash: "" } as any as Location;
	});
	afterAll(() => {
		window.location = location;
	});
	it("test searchs", (done) => {
		function Home() {
			const { searchs, getSreachByKey } = useSearch();
			expect(isFunction(getSreachByKey)).toBe(true);
			React.useEffect(() => {
				expect(searchs).toEqual({
					the: "search",
				});
				expect(getSreachByKey("the")).toEqual("search");
				done();
			}, [searchs.the]);
			return <h1>Home</h1>;
		}

		TestRenderer.act(() => {
			TestRenderer.create(
				<MemoryRouter initialEntries={["/home?the=search"]}>
					<Routes>
						<Route path="/home" element={<Home />} />
					</Routes>
				</MemoryRouter>
			);
		});
	});
});
