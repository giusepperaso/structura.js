import b from "benny";
import { produce as structura } from "../index";
import { produce as immer } from "immer";
import { Obj2 } from "../integration/utils";

const myObj: Obj2<number> = {};
for (let i = 0; i != 10000; i++) {
  myObj["prop" + i] = {
    prop: 1,
  };
}

b.suite(
  "Produce huge object",

  b.add("with structura", () => {
    structura(myObj, (draft) => {
      draft["prop111"].prop++;
      draft["prop1111"].prop++;
      draft["prop222"].prop++;
      draft["prop2222"].prop++;
      draft["prop333"].prop++;
      draft["prop3333"].prop++;
      draft["prop444"].prop++;
      draft["prop4444"].prop++;
      draft["prop555"].prop++;
      draft["prop5557"].prop++;
      draft["prop666"].prop++;
      draft["prop6666"].prop++;
      draft["prop777"].prop++;
      draft["prop7777"].prop++;
      draft["prop888"].prop++;
      draft["prop8888"].prop++;
      draft["prop999"].prop++;
      draft["prop9999"].prop++;
    });
  }),

  b.add("with immer", () => {
    immer(myObj, (draft) => {
      draft["prop111"].prop++;
      draft["prop1111"].prop++;
      draft["prop222"].prop++;
      draft["prop2222"].prop++;
      draft["prop333"].prop++;
      draft["prop3333"].prop++;
      draft["prop444"].prop++;
      draft["prop4444"].prop++;
      draft["prop555"].prop++;
      draft["prop5557"].prop++;
      draft["prop666"].prop++;
      draft["prop6666"].prop++;
      draft["prop777"].prop++;
      draft["prop7777"].prop++;
      draft["prop888"].prop++;
      draft["prop8888"].prop++;
      draft["prop999"].prop++;
      draft["prop9999"].prop++;
    });
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "huge", version: "1.0.0" }),
  b.save({ file: "huge", format: "chart.html" })
);
