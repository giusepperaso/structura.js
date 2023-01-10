import b from "benny";
import { enableStrictCopy, produce as structura } from "../index";
import { produce as immer, setAutoFreeze } from "immer";
import { Map as immutable } from "immutable";

setAutoFreeze(false);

enableStrictCopy(false);

b.suite(
  "Produce small object with many modifications",

  b.add("STRUCTURA", () => {
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

  b.add("IMMER", () => {
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

  b.add("IMMUTABLE", () => {
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

  b.cycle(),
  b.complete(),
  b.save({ file: "small_many", format: "chart.html" })
);
