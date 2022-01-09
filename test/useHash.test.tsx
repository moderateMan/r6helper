import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import useHash from '../src/hooks/useHash'
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import { isFunction } from '../src/utils/index'

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
      const [flag, setFlag] = React.useState(0)
      const hook = useHash();
      const hash = hook.hashs
      const changeHash = hook.changeHash
      changeHash({ the: 'changeHash' })
      React.useEffect(() => {
        if (Object.values(hash).length) {
          expect(hash).toEqual({ "the": "hash" })
          changeHash({ the: 'changeHash123' })
          setFlag(2)
        }
      }, [window.location.hash])
      if (flag == 2) {
        expect(hash).toEqual({ "the": "changeHash123" })
        done()
      }
      return <h1>Home</h1>;
    }

    TestRenderer.act(() => {
      TestRenderer.create(
        <MemoryRouter initialEntries={["/home#?the=hash"]}>
          <Routes>
            <Route path="/home" element={<Home />} />
          </Routes>
        </MemoryRouter>
      );
    });
  });
});