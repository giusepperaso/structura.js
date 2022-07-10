import { describe, expect, it } from "vitest";
import { produce } from "..";

describe.concurrent("set tests", () => {
  it("works with sets with no nesting", async () => {
    const myObj = new Set();
    myObj.add([0]);
    const result = produce(myObj, (draft) => {
      draft.forEach((v) => (v[0] = 1));

      /* for (const v of draft.values()) {
        v[0] = 1;
      } */
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(1);
    expect(result.size).toBe(1);
    /* expect(Array.from(myObj.values())).toEqual([[0]]);
    expect(Array.from(result.values())).toEqual([[1]]); */
  });
  /*it("works with maps, both as root and nested", async () => {
    const myObj = new Map();
    myObj.set("test1", { prop: 1 });
    myObj.set("test2", { prop: new Map() });
    myObj.set("test3", 0);
    myObj.get("test2").prop.set("prop", 1);
    const result = produce(myObj, (draft) => {
      draft.get("test1").prop++;
      draft.get("test1").prop++;
      draft.set("test3", draft.get("test3") + 1);
      draft.set("test3", draft.get("test3") + 1);
    });
    expect(myObj).not.toBe(result);
    expect(myObj.get("test1")).not.toBe(result.get("test1"));
    expect(myObj.get("test1").prop).toBe(1);
    expect(result.get("test1").prop).toBe(3);
    expect(myObj.get("test3")).toBe(0);
    expect(result.get("test3")).toBe(2);
  }); */
  it("works with set delete", async () => {
    const entries = [[0], [1]];
    const myObj = new Set(entries);
    const result = produce(myObj, (draft) => {
      draft.delete(entries[0]);
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(2);
    expect(result.size).toBe(1);
    // expect(Array.from(result.entries())).toEqual([entries[1]]);
  });
  it("works with set clear", async () => {
    const myObj = new Set([0]);
    const result = produce(myObj, (draft) => {
      draft.clear();
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(1);
    expect(result.size).toBe(0);
  });
});
