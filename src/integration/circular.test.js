import { describe, expect, it } from "vitest";
import { produce } from "..";

describe.concurrent("circular tests", () => {
  it("works with circular references, even with repeating references", async () => {
    const myObj = {
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
      draft.prop.sub.subprop = {};
      draft.prop3.sub.subprop = {};
    });
    expect(myObj).not.toBe(result);
    expect(myObj.prop).not.toBe(result.prop);
    expect(myObj.prop.sub).not.toBe(result.prop.sub);
    expect(result.prop.sub).not.toBe(result.prop2.sub);
    expect(result.prop3.sub).toBe(result.prop.sub);
  });
  it("works with multiple parents", async () => {
    const myObj = {
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
      draft.prop.sub.subprop = {};
      draft.prop3.sub.subprop = {};
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
