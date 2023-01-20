import b from "benny";
import { enableStrictCopy, produce as structura } from "../index";
import { produce as immer, setAutoFreeze } from "immer";
import { Map as immutable } from "immutable";

b.suite(
  "Produce small object with many modifications",

  b.add("STRUCTURA (no strict copy)", () => {
    enableStrictCopy(false);
    const myObj = { test: 1 };
    structura(myObj, (draft) => {
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
    });
  }),

  b.add("STRUCTURA (with strict copy)", () => {
    enableStrictCopy(true);
    const myObj = { test: 1 };
    structura(myObj, (draft) => {
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
    });
  }),

  b.add("IMMER (no auto freeze)", () => {
    setAutoFreeze(false);
    const myObj = { test: 1 };
    immer(myObj, (draft) => {
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
    });
  }),

  b.add("IMMER (with auto freeze)", () => {
    setAutoFreeze(true);
    const myObj = { test: 1 };
    immer(myObj, (draft) => {
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
      draft.test = 2;
      draft.test = 3;
      draft.test = 4;
    });
  }),

  b.add("IMMUTABLE (no toJS)", () => {
    const myObj = { test: 1 };
    const map = immutable(myObj);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
  }),

  b.add("IMMUTABLE (with toJS)", () => {
    const myObj = { test: 1 };
    const map = immutable(myObj);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.set("test", 2);
    map.set("test", 3);
    map.set("test", 4);
    map.toJS();
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "small_many", format: "chart.html" })
);
