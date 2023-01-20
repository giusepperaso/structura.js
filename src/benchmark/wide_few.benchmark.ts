import b from "benny";
import { enableStrictCopy, produce as structura } from "../index";
import { produce as immer, setAutoFreeze } from "immer";
import { Map as immutable } from "immutable";
import { Obj2 } from "../integration/utils";

function getMyObj() {
  const myObj: Obj2<number> = {};
  for (let i = 0; i != 10000; i++) {
    myObj["prop" + i] = {
      prop: 1,
    };
  }
  return myObj;
}

b.suite(
  "Produce wide object with few modifications",

  b.add("STRUCTURA (no strict copy)", () => {
    enableStrictCopy(false);
    structura(getMyObj(), (draft) => {
      draft["prop111"].prop = 2;
      draft["prop1111"].prop = 2;
      draft["prop222"].prop = 2;
    });
  }),

  b.add("STRUCTURA (with stict copy)", () => {
    enableStrictCopy(true);
    structura(getMyObj(), (draft) => {
      draft["prop111"].prop = 2;
      draft["prop1111"].prop = 2;
      draft["prop222"].prop = 2;
    });
  }),

  b.add("IMMER (no auto freeze)", () => {
    setAutoFreeze(false);
    immer(getMyObj(), (draft) => {
      draft["prop111"].prop = 2;
      draft["prop1111"].prop = 2;
      draft["prop222"].prop = 2;
    });
  }),

  b.add("IMMER (with auto freeze)", () => {
    setAutoFreeze(true);
    immer(getMyObj(), (draft) => {
      draft["prop111"].prop = 2;
      draft["prop1111"].prop = 2;
      draft["prop222"].prop = 2;
    });
  }),

  b.add("IMMUTABLE (no toJS)", () => {
    const map = immutable(getMyObj());
    map.setIn(["prop111", "prop"], 2);
    map.setIn(["prop1111", "prop"], 2);
    map.setIn(["prop222", "prop"], 2);
  }),

  b.add("IMMUTABLE (with toJS)", () => {
    const map = immutable(getMyObj());
    map.setIn(["prop111", "prop"], 2);
    map.setIn(["prop1111", "prop"], 2);
    map.setIn(["prop222", "prop"], 2);
    map.toJS();
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "wide_few", format: "chart.html" })
);
