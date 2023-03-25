import { expect, it } from "vitest";
import { runMultiple, produceTest as produce } from "./utils";

runMultiple("verify that Sets work correctly", () => {
  it("works with sets forEach and no nesting", async () => {
    const myObj: Set<number[]> = new Set();
    myObj.add([0]);
    const result = produce(myObj, (draft) => {
      draft.forEach((v) => (v[0] = 1));
    });
    const result2 = produce(result, (draft) => {
      draft.forEach((v) => (v[0] = 1));
    });
    produce(result2, (draft) => {
      draft.forEach((v) => (v[0] = 1));
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(1);
    expect(result.size).toBe(1);
    expect(Array.from(myObj.values())).toEqual([[0]]);
    expect(Array.from(result.values())).toEqual([[1]]);
  });
  it("works with sets values and no nesting", async () => {
    const myObj: Set<number[]> = new Set();
    myObj.add([0]);
    myObj.add([1]);
    const result = produce(myObj, (draft) => {
      for (const v of draft.values()) {
        v[0]++;
        v[0]++;
      }
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(2);
    expect(result.size).toBe(2);
    expect(Array.from(myObj.values())).toEqual([[0], [1]]);
    expect(Array.from(result.values())).toEqual([[2], [3]]);
  });
  it("works with nested sets", async () => {
    const myObj: Set<Set<number[]>> = new Set();
    const myObj2: Set<number[]> = new Set();
    myObj.add(myObj2);
    myObj2.add([0]);
    const result = produce(myObj, (draft) => {
      for (const v of draft.values()) {
        for (const sub of v.values()) {
          sub[0]++;
          sub[0]++;
        }
      }
    });
    produce(result, (draft) => {
      for (const v of draft.values()) {
        for (const sub of v.values()) {
          sub[0]++;
          sub[0]++;
        }
      }
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(1);
    expect(result.size).toBe(1);
    expect(Array.from(myObj.values())).toEqual([new Set([[0]])]);
    expect(Array.from(result.values())).toEqual([new Set([[2]])]);
  });
  it("works with set delete", async () => {
    const entries = [[0], [1]];
    const myObj = new Set(entries);
    const result = produce(myObj, (draft) => {
      draft.delete(entries[0]);
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(2);
    expect(result.size).toBe(1);
    expect(Array.from(result.values())).toEqual([entries[1]]);
  });
  it("works with set delete with primitive", async () => {
    const myObj = new Set([0]);
    const result = produce(myObj, (draft) => {
      draft.delete(0);
    });
    expect(myObj).not.toBe(result);
    expect(myObj.size).toBe(1);
    expect(result.size).toBe(0);
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
