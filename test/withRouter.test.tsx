import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { R6Provider } from '../src/index'
import withRouter, { WithRouterPropsT } from '../src/hocs/withRouter'
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import { isFunction } from '../src/utils/index'

describe("withRouter", () => {
  beforeAll(() => {
    delete (window as any).location;
    window.location = {} as any as Location;
  });
  afterAll(() => {
    window.location = location;
  });
  it("test withRouter", (done) => {
    expect(isFunction(withRouter)).toBe(true)
    const Page1 = withRouter(function (props: WithRouterPropsT) {
      const { router: { location, navigate, searchs, changeSearch } } = props;
      React.useEffect(() => {
        expect(location.search).toBe('?a=search1&b=search2')
        expect(location.pathname).toBe('/page1')
        expect(location.hash).toBe('#the-hash')
        expect(searchs).toEqual({
          a: "search1",
          b: "search2"
        })
        navigate('/page2/2')
        done()
      })
      return <h1>Page1</h1>;
    })
    const Page2 = withRouter(function (props: WithRouterPropsT) {
      const { router: { params, searchs, changeSearch } } = props;
      React.useEffect(() => {
        expect(params).toEqual({
          id: 2
        })
      })
      return <h1>Page2</h1>;
    })
    TestRenderer.act(() => {
      TestRenderer.create(
        <MemoryRouter initialEntries={["/page1?a=search1&b=search2#the-hash"]}>
          <R6Provider>
            <Routes>
              <Route path="/page1" element={<Page1 />} />
              <Route path="/page2:id" element={<Page2 />} />
            </Routes>
          </R6Provider>
        </MemoryRouter>
      );
    });
  });
});