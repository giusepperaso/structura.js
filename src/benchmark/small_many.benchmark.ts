import b from "benny";
import { produce as structura } from "../index";
import { produce as immer } from "immer";
import { Map as immutable } from "immutable";

b.suite(
  "Produce small object with many modifications",

  b.add("with structura", () => {
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

  b.add("with immer", () => {
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

  b.add("with immutable", () => {
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
  b.save({ file: "small_many", version: "1.0.0" }),
  b.save({ file: "small_many", format: "chart.html" })
);
