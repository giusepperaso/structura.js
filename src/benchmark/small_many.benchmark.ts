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
      for (let i = 0; i !== 100; i++) {
        draft.test++;
      }
    });
  }),

  b.add("STRUCTURA (with strict copy)", () => {
    enableStrictCopy(true);
    const myObj = { test: 1 };
    structura(myObj, (draft) => {
      for (let i = 0; i !== 100; i++) {
        draft.test++;
      }
    });
  }),

  b.add("IMMER (no auto freeze)", () => {
    setAutoFreeze(false);
    const myObj = { test: 1 };
    immer(myObj, (draft) => {
      for (let i = 0; i !== 100; i++) {
        draft.test++;
      }
    });
  }),

  b.add("IMMER (with auto freeze)", () => {
    setAutoFreeze(true);
    const myObj = { test: 1 };
    immer(myObj, (draft) => {
      for (let i = 0; i !== 100; i++) {
        draft.test++;
      }
    });
  }),

  b.add("IMMUTABLE (no toJS)", () => {
    const myObj = { test: 1 };
    const map = immutable(myObj);
    for (let i = 0; i !== 100; i++) {
      map.set("test", i + 2);
    }
  }),

  b.add("IMMUTABLE (with toJS)", () => {
    const myObj = { test: 1 };
    const map = immutable(myObj);
    for (let i = 0; i !== 100; i++) {
      map.set("test", i + 2);
    }
    map.toJS();
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "small_many", format: "chart.html" })
);
