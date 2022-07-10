import { describe, expect, it } from "vitest";
import { produce } from "..";

describe.concurrent("reference tests", () => {
  it("should not modify objects if no modifications happen", async () => {
    const myObj = {
      prop: {
        sub: {},
      },
    };
    const result = produce(myObj, (draft) => {
      draft.prop.sub;
    });
    expect(myObj).toBe(result);
    expect(myObj.prop).toBe(result.prop);
    expect(myObj.prop.sub).toBe(result.prop.sub);
  });
  it("should shallow copy only objects that were modified", async () => {
    const myObj = {
      prop: {
        sub: {},
      },
      prop2: {
        sub: {},
      },
    };
    const newSub = {};
    const result = produce(myObj, (draft) => {
      draft.prop.sub = {};
      draft.prop.sub2 = newSub;
    });
    expect(myObj).not.toBe(result);
    expect(myObj.prop).not.toBe(result.prop);
    expect(myObj.prop.sub).not.toBe(result.prop.sub);
    expect(result.prop.sub2).toBe(newSub);
    expect(result.prop2).toBe(result.prop2);
    expect(result.prop2.sub).toBe(result.prop2.sub);
  });
  it("should allow reassign of objects", async () => {
    const myObj = {
      prop: {
        sub: {},
      },
    };
    const result = produce(myObj, (draft) => {
      draft.prop.sub.tt = "prova";
      draft.prop.sub = {};
      draft.prop.sub.ciao = "prova2";
      draft.prop.sub = [1];
      draft.prop.sub[0] = [1];
      draft.prop.sub = {};
      draft.prop.sub.ciao = "prova3";
    });
    expect(result.prop.sub).toEqual({ ciao: "prova3" });
  });
  it("should allow reassign of objects on superior levels", async () => {
    const myObj = {
      prop: {
        sub: {},
      },
    };
    const result = produce(myObj, (draft) => {
      draft.prop.sub.tt = "prova";
      draft.prop = {};
      draft.prop.ciao = "prova2";
      draft.prop = [1];
      draft.prop[0] = [1];
      draft.prop = {};
      draft.prop.ciao = "prova3";
    });
    expect(result.prop).toEqual({ ciao: "prova3" });
  });
});
