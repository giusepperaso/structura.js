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
  "Produce wide object with many modifications",

  b.add("STRUCTURA", () => {
    structura(getMyObj(), (draft) => {
      draft["prop111"].prop = 2;
      draft["prop1111"].prop = 2;
      draft["prop222"].prop = 2;
      draft["prop2222"].prop = 2;
      draft["prop333"].prop = 2;
      draft["prop3333"].prop = 2;
      draft["prop444"].prop = 2;
      draft["prop4444"].prop = 2;
      draft["prop555"].prop = 2;
      draft["prop5557"].prop = 2;
      draft["prop666"].prop = 2;
      draft["prop6666"].prop = 2;
      draft["prop777"].prop = 2;
      draft["prop7777"].prop = 2;
      draft["prop888"].prop = 2;
      draft["prop8888"].prop = 2;
      draft["prop999"].prop = 2;
      draft["prop9999"].prop = 2;
      draft["prop111"].prop = 3;
      draft["prop1111"].prop = 3;
      draft["prop222"].prop = 3;
      draft["prop2222"].prop = 3;
      draft["prop333"].prop = 3;
      draft["prop3333"].prop = 3;
      draft["prop444"].prop = 3;
      draft["prop4444"].prop = 3;
      draft["prop555"].prop = 3;
      draft["prop5557"].prop = 3;
      draft["prop666"].prop = 3;
      draft["prop6666"].prop = 3;
      draft["prop777"].prop = 3;
      draft["prop7777"].prop = 3;
      draft["prop888"].prop = 3;
      draft["prop8888"].prop = 3;
      draft["prop999"].prop = 3;
      draft["prop9999"].prop = 3;
    });
  }),

  b.add("IMMER", () => {
    immer(getMyObj(), (draft) => {
      draft["prop111"].prop = 2;
      draft["prop1111"].prop = 2;
      draft["prop222"].prop = 2;
      draft["prop2222"].prop = 2;
      draft["prop333"].prop = 2;
      draft["prop3333"].prop = 2;
      draft["prop444"].prop = 2;
      draft["prop4444"].prop = 2;
      draft["prop555"].prop = 2;
      draft["prop5557"].prop = 2;
      draft["prop666"].prop = 2;
      draft["prop6666"].prop = 2;
      draft["prop777"].prop = 2;
      draft["prop7777"].prop = 2;
      draft["prop888"].prop = 2;
      draft["prop8888"].prop = 2;
      draft["prop999"].prop = 2;
      draft["prop9999"].prop = 2;
      draft["prop111"].prop = 3;
      draft["prop1111"].prop = 3;
      draft["prop222"].prop = 3;
      draft["prop2222"].prop = 3;
      draft["prop333"].prop = 3;
      draft["prop3333"].prop = 3;
      draft["prop444"].prop = 3;
      draft["prop4444"].prop = 3;
      draft["prop555"].prop = 3;
      draft["prop5557"].prop = 3;
      draft["prop666"].prop = 3;
      draft["prop6666"].prop = 3;
      draft["prop777"].prop = 3;
      draft["prop7777"].prop = 3;
      draft["prop888"].prop = 3;
      draft["prop8888"].prop = 3;
      draft["prop999"].prop = 3;
      draft["prop9999"].prop = 3;
    });
  }),

  b.add("IMMUTABLE", () => {
    const map = immutable(getMyObj());

    map.setIn(["prop111", "prop"], 2);
    map.setIn(["prop1111", "prop"], 2);
    map.setIn(["prop222", "prop"], 2);
    map.setIn(["prop2222", "prop"], 2);
    map.setIn(["prop333", "prop"], 2);
    map.setIn(["prop3333", "prop"], 2);
    map.setIn(["prop444", "prop"], 2);
    map.setIn(["prop4444", "prop"], 2);
    map.setIn(["prop555", "prop"], 2);
    map.setIn(["prop5557", "prop"], 2);
    map.setIn(["prop666", "prop"], 2);
    map.setIn(["prop6666", "prop"], 2);
    map.setIn(["prop777", "prop"], 2);
    map.setIn(["prop7777", "prop"], 2);
    map.setIn(["prop888", "prop"], 2);
    map.setIn(["prop8888", "prop"], 2);
    map.setIn(["prop999", "prop"], 2);
    map.setIn(["prop9999", "prop"], 2);
    map.setIn(["prop111", "prop"], 3);
    map.setIn(["prop1111", "prop"], 3);
    map.setIn(["prop222", "prop"], 3);
    map.setIn(["prop2222", "prop"], 3);
    map.setIn(["prop333", "prop"], 3);
    map.setIn(["prop3333", "prop"], 3);
    map.setIn(["prop444", "prop"], 3);
    map.setIn(["prop4444", "prop"], 3);
    map.setIn(["prop555", "prop"], 3);
    map.setIn(["prop5557", "prop"], 3);
    map.setIn(["prop666", "prop"], 3);
    map.setIn(["prop6666", "prop"], 3);
    map.setIn(["prop777", "prop"], 3);
    map.setIn(["prop7777", "prop"], 3);
    map.setIn(["prop888", "prop"], 3);
    map.setIn(["prop8888", "prop"], 3);
    map.setIn(["prop999", "prop"], 3);
    map.setIn(["prop9999", "prop"], 3);
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "wide_many", version: "1.0.0" }),
  b.save({ file: "wide_many", format: "chart.html" })
);
