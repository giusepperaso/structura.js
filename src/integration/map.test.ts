import { describe, expect, it } from "vitest";
import { Obj } from "./utils";
import { produce } from "..";

type Entry = [string, Obj<number>];

describe.concurrent("verify that Maps work correctly", async () => {
  it("works with maps with no nesting", async () => {
    const myObj = new Map();
    myObj.set("test", [0]);
    const result = produce(myObj, (draft) => {
      draft.get("test")[0]++;
    });
    const result2 = produce(result, (draft) => {
      draft.get("test")[0]++;
    });
    produce(result2, (draft) => {
      draft.get("test")[0]++;
    });
    expect(myObj).not.toBe(result);
    expect(myObj.get("test")[0]).toBe(0);
    expect(result.get("test")[0]).toBe(1);
  });
  it("works with maps, both as root and nested", async () => {
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
  });
  it("works with map delete", async () => {
    const entries: Entry[] = [
      ["test1", { prop: 1 }],
      ["test2", { prop: 2 }],
      ["test3", { prop: 3 }],
    ];
    const myObj = new Map(entries);
    const result = produce(myObj, (draft) => {
      draft.delete("test1");
      draft.delete("test3");
    });
    expect(myObj).not.toBe(result);
    expect(Array.from(myObj.entries())).toEqual(entries);
    expect(Array.from(result.entries())).toEqual([entries[1]]);
  });
  it("works with map clear", async () => {
    const entries: Entry[] = [
      ["test1", { prop: 1 }],
      ["test2", { prop: 2 }],
      ["test3", { prop: 3 }],
    ];
    const myObj = new Map(entries);
    const result = produce(myObj, (draft) => {
      draft.set("test4", { prop: 4 });
      draft.clear();
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(3);
    expect(result.size).toBe(0);
  });
  it("works with map values and entries", async () => {
    const entries: Entry[] = [
      ["test1", { prop: 1 }],
      ["test2", { prop: 2 }],
      ["test3", { prop: 3 }],
    ];
    const entriesAltered = [
      ["test1", { prop: 3 }],
      ["test2", { prop: 4 }],
      ["test3", { prop: 5 }],
    ];
    const myObj = new Map(entries);
    const result = produce(myObj, (draft) => {
      for (const v of draft.values()) {
        v.prop = v.prop + 1;
      }
      for (const [, v] of draft.entries()) {
        v.prop = v.prop + 1;
      }
    });
    expect(myObj).not.toBe(result);
    expect(Array.from(myObj.entries())).toEqual(entries);
    expect(Array.from(result.entries())).toEqual(entriesAltered);
  });
  it("works with map foreach", async () => {
    const entries: Entry[] = [
      ["test1", { prop: 1 }],
      ["test2", { prop: 2 }],
      ["test3", { prop: 3 }],
    ];
    const entriesAltered: Entry[] = [
      ["test1", { prop: 3 }],
      ["test2", { prop: 4 }],
      ["test3", { prop: 5 }],
    ];
    const myObj = new Map(entries);
    const result = produce(myObj, (draft) => {
      draft.forEach((v) => {
        v.prop = v.prop + 2;
      });
    });
    expect(myObj).not.toBe(result);
    expect(Array.from(myObj.entries())).toEqual(entries);
    expect(Array.from(result.entries())).toEqual(entriesAltered);
  });
});
