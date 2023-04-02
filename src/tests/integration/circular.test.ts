import { expect, it } from "vitest";
import { runMultiple, Obj, Obj2 } from "./utils";
import { produceTest as produce } from "./utils";

runMultiple("verify that circular references don't cause problems", () => {
  it("works with circular references, even with repeating references", async () => {
    const myObj: Obj2<Obj | null> = {
      prop: {
        sub: null,
      },
      prop2: {
        sub: null,
      },
      prop3: {
        sub: null,
      },
    };
    myObj.prop.sub = myObj;
    myObj.prop2.sub = myObj;
    myObj.prop3.sub = myObj;
    const result = produce(myObj, (draft) => {
      (draft.prop.sub as Obj).subprop = {};
      (draft.prop3.sub as Obj).subprop = {};
    });
    expect(myObj).not.toBe(result);
    expect(myObj.prop).not.toBe(result.prop);
    expect(myObj.prop.sub).not.toBe(result.prop.sub);
    expect(result.prop.sub).not.toBe(result.prop2.sub);
    expect(result.prop3.sub).toBe(result.prop.sub);
  });
  it("doesn't go infinite with possible loop", async () => {
    const state: any = { test1: [1], test2: [2], test3: null };
    state.test3 = state;
    produce(state, (draft) => {
      draft.test3.test1.push(999);
    });
  });
  it("works with multiple parents", async () => {
    const myObj: Obj2<Obj | null> = {
      prop: {
        sub: null,
      },
      prop2: {
        sub: null,
      },
      prop3: {
        sub: null,
      },
    };
    const mySubObj = {};
    myObj.prop.sub = mySubObj;
    myObj.prop2.sub = mySubObj;
    myObj.prop3.sub = mySubObj;
    const result = produce(myObj, (draft) => {
      (draft.prop.sub as Obj).subprop = {};
      (draft.prop3.sub as Obj).subprop = {};
    });
    expect(myObj).not.toBe(result);
    expect(myObj.prop).not.toBe(result.prop);
    expect(myObj.prop.sub).not.toBe(result.prop.sub);
    expect(myObj.prop.sub).toBe(result.prop2.sub);
    expect(myObj.prop2.sub).toBe(result.prop2.sub);
    expect(myObj.prop3.sub).not.toBe(result.prop3.sub);
    expect(result.prop.sub).toBe(result.prop3.sub);
    expect(result.prop).not.toBe(result.prop3); // they are different objects, so this is right
  });
});
