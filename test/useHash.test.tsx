import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { MemoryRouter, Routes, Route } from "react-router";
import { useHash } from "../src/index";
import { isFunction } from "../src/utils/index";

describe("useHash", () => {
	beforeAll(() => {
		delete (window as any).location;
		window.location = { hash: "" } as any as Location;
	});
	afterAll(() => {
		window.location = location;
	});
	it("test hashs", (done) => {
		function Home() {
			const [flag, setFlag] = React.useState(0);
			const { hashs, changeHash, getHashByKey } = useHash();
			expect(isFunction(changeHash)).toBe(true);
			expect(isFunction(getHashByKey)).toBe(true);
			React.useEffect(() => {
				if (!Object.values(hashs).length) {
					expect(hashs).toEqual({});
					expect(getHashByKey("the")).toEqual("");
					changeHash({ the: "changeHash1" });
					setFlag(2);
				} else {
					if (flag !== 3) {
						expect(hashs).toEqual({ the: "changeHash1" });
						expect(getHashByKey("the")).toEqual("changeHash1");
						changeHash({ the: "changeHash2" });
						setFlag(3);
					}
				}
			}, [hashs.the]);
			if (flag == 3) {
				expect(hashs).toEqual({ the: "changeHash2" });
				expect(getHashByKey("the")).toEqual("changeHash2");
				done();
			}
			return <h1>Home</h1>;
		}

		TestRenderer.act(() => {
			TestRenderer.create(
				<MemoryRouter initialEntries={["/home#the=hash"]}>
					<Routes>
						<Route path="/home" element={<Home />} />
					</Routes>
				</MemoryRouter>
			);
		});
	});
});
