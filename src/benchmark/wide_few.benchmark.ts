import b from "benny";
import { produce as structura } from "../index";
import { produce as immer, setAutoFreeze } from "immer";
import { Map as immutable } from "immutable";
import { Obj2 } from "../integration/utils";

setAutoFreeze(false);

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

  b.add("STRUCTURA", () => {
    structura(getMyObj(), (draft) => {
      draft["prop111"].prop = 2;
      draft["prop1111"].prop = 2;
      draft["prop222"].prop = 2;
    });
  }),

  b.add("IMMER", () => {
    immer(getMyObj(), (draft) => {
      draft["prop111"].prop = 2;
      draft["prop1111"].prop = 2;
      draft["prop222"].prop = 2;
    });
  }),

  b.add("IMMUTABLE", () => {
    const map = immutable(getMyObj());
    map.setIn(["prop111", "prop"], 2);
    map.setIn(["prop1111", "prop"], 2);
    map.setIn(["prop222", "prop"], 2);
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "wide_few", format: "chart.html" })
);
