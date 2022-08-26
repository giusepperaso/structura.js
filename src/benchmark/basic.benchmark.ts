import b from "benny";
import { produce as structura } from "../index";
import { produce as immer } from "immer";

b.suite(
  "Produce simple object",

  b.add("with structura", () => {
    const myObj = { test: 1 };
    structura(myObj, (draft) => {
      draft.test++;
      draft.test++;
      draft.test++;
    });
  }),

  b.add("with immer", () => {
    const myObj = { test: 1 };
    immer(myObj, (draft) => {
      draft.test++;
      draft.test++;
      draft.test++;
    });
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "basic", version: "1.0.0" }),
  b.save({ file: "basic", format: "chart.html" })
);
