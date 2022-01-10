import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import ReactTestUtils from "react-dom/test-utils"; // ES6

import {
	R6Provider,
	withRouter,
	WithRouterPropsT,
	useGo,
	goto,
	useGuard,
	NotifyDataT,
} from "../src/index";
import { MemoryRouter, Routes, Route } from "react-router";

describe("useGuard", () => {
	beforeAll(() => {
		delete (window as any).location;
		window.location = { hash: "" } as any as Location;
	});
	afterAll(() => {
		window.location = location;
	});
	it("test useGuard A", (done) => {
		const handleClick = () => {};
		const Page1 = withRouter(function (props: WithRouterPropsT) {
			const {
				router: { location },
			} = props;
			useGuard({
				preGuardHandler: () => {
					return false;
				},
				guardedListener: (params: NotifyDataT) => {
					const { url, callFunc } = params;
					expect(url).toBe("/page2");
					callFunc();
				},
			});
			React.useEffect(() => {
				expect(location.pathname).toBe("/page1");
				goto("/page2");
			});
			return <h1>Page1</h1>;
		});
		function Page2() {
			done();
			return <div>Page2</div>;
		}

		TestRenderer.act(() => {
			TestRenderer.create(
				<MemoryRouter initialEntries={["/page1?the=search#the-hash"]}>
					<R6Provider>
						<Routes>
							<Route path="/page1" element={<Page1 />} />
							<Route path="/page2" element={<Page2 />} />
						</Routes>
						<button
							onClick={() => {
								handleClick();
							}}
						>
							testBtn
						</button>
					</R6Provider>
				</MemoryRouter>
			);
		});
	});
	it("test useGuard promise", (done) => {
		const handleClick = () => {};
		const Page1 = withRouter(function (props: WithRouterPropsT) {
			const {
				router: { location },
			} = props;
			useGuard({
				preGuardHandler: Promise.resolve(false),
				guardedListener: (params: NotifyDataT) => {
					const { url, callFunc } = params;
					expect(url).toBe("/page2");
					callFunc();
				},
			});
			React.useEffect(() => {
				expect(location.pathname).toBe("/page1");
				goto("/page2");
			});
			return <h1>Page1</h1>;
		});
		function Page2() {
			done();
			return <div>Page2</div>;
		}

		TestRenderer.act(() => {
			TestRenderer.create(
				<MemoryRouter initialEntries={["/page1?the=search#the-hash"]}>
					<R6Provider>
						<Routes>
							<Route path="/page1" element={<Page1 />} />
							<Route path="/page2" element={<Page2 />} />
						</Routes>
						<button
							onClick={() => {
								handleClick();
							}}
						>
							testBtn
						</button>
					</R6Provider>
				</MemoryRouter>
			);
		});
	});
	it("test useGuard callFunc&promise", (done) => {
		const handleClick = () => {};
		const Page1 = withRouter(function (props: WithRouterPropsT) {
			const {
				router: { location },
			} = props;
			useGuard({
				preGuardHandler: () => {
					return Promise.resolve(false);
				},
				guardedListener: (params: NotifyDataT) => {
					const { url, callFunc } = params;
					expect(url).toBe("/page2");
					callFunc();
				},
			});
			React.useEffect(() => {
				expect(location.pathname).toBe("/page1");
				goto("/page2");
			});
			return <h1>Page1</h1>;
		});
		function Page2() {
			done();
			return <div>Page2</div>;
		}

		TestRenderer.act(() => {
			TestRenderer.create(
				<MemoryRouter initialEntries={["/page1?the=search#the-hash"]}>
					<R6Provider>
						<Routes>
							<Route path="/page1" element={<Page1 />} />
							<Route path="/page2" element={<Page2 />} />
						</Routes>
						<button
							onClick={() => {
								handleClick();
							}}
						>
							testBtn
						</button>
					</R6Provider>
				</MemoryRouter>
			);
		});
	});
	it("test useGuard callFunc&promise", (done) => {
		const handleClick = () => {};
		const Page1 = withRouter(function (props: WithRouterPropsT) {
			const {
				router: { location },
			} = props;
			useGuard({
				preGuardHandler: () => {
					return Promise.resolve(false);
				},
				guardedListener: (params: NotifyDataT) => {
					const { url, callFunc } = params;
					expect(url).toBe("/page2");
					callFunc();
				},
			});
			React.useEffect(() => {
				expect(location.pathname).toBe("/page1");
				goto("/page2");
			});
			return <h1>Page1</h1>;
		});
		function Page2() {
			done();
			return <div>Page2</div>;
		}

		TestRenderer.act(() => {
			TestRenderer.create(
				<MemoryRouter initialEntries={["/page1?the=search#the-hash"]}>
					<R6Provider>
						<Routes>
							<Route path="/page1" element={<Page1 />} />
							<Route path="/page2" element={<Page2 />} />
						</Routes>
						<button
							onClick={() => {
								handleClick();
							}}
						>
							testBtn
						</button>
					</R6Provider>
				</MemoryRouter>
			);
		});
	});
	it("test useGuard dep", (done) => {
		const Page1 = withRouter(function (props: WithRouterPropsT) {
			const btn = React.useRef<HTMLButtonElement>();
			const [flag, setFlag] = React.useState(false);
			const handleClick = () => {
				setFlag(true);
				setTimeout(() => {
					goto("/page2");
				}, 1000);
			};
			const {
				router: { location },
			} = props;
			React.useEffect(() => {
				if (btn.current) {
					setTimeout(() => {
						btn.current.dispatchEvent(
							new MouseEvent("click", { bubbles: true })
						);
					}, 1000);
				}
			});
			useGuard(
				{
					preGuardHandler: () => {
						return flag;
					},
				},
				[flag]
			);
			React.useEffect(() => {
				expect(location.pathname).toBe("/page1");
			});
			return (
				<h1>
					<button
						ref={btn}
						onClick={() => {
							handleClick();
						}}
					>
						testBtn
					</button>
					Page1
				</h1>
			);
		});
		function Page2() {
			done();
			return <div>Page2</div>;
		}
		const comp = TestRenderer.create(
			<MemoryRouter initialEntries={["/page1?the=search#the-hash"]}>
				<R6Provider>
					<Routes>
						<Route path="/page1" element={<Page1 />} />
						<Route path="/page2" element={<Page2 />} />
					</Routes>
				</R6Provider>
			</MemoryRouter>
		);
		comp.root.findByType("button").props.onClick();
		TestRenderer.act(() => {
			comp;
		});
	});
});
