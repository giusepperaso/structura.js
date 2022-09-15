import { describe, expect, it } from "vitest";
import { produce } from "..";

describe.concurrent("tests transpositions of element", () => {
  it("works with arrays traspositions via reverse", async () => {
    const myObj = [{ a: 0 }, { a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }];
    const result = produce(myObj, (draft) => {
      draft[0].a = 11;
      draft.reverse();
      draft.reverse();
      draft.reverse();
      draft[0].a = 55;
    });
    expect(myObj).not.toBe(result);
    expect(result[0]).not.toBe(myObj[0]);
    expect(result[1]).not.toBe(myObj[1]);
    expect(result[2]).toBe(myObj[2]);
    expect(result[3]).toBe(myObj[1]);
    expect(result[1]).toBe(myObj[3]);
    expect(result[0].a).toBe(55);
    expect(result[4].a).toBe(55);
  });

  it("manual transposition/reverse", async () => {
    const myObj = [{ a: 0 }, { a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }];
    const result = produce(myObj, (draft) => {
      draft[0].a = 11;
      const e0 = draft[0];
      const e1 = draft[1];
      const tt = (draft[0] = draft[4]);
      //tt.a = 5; // this would not work because tt is now a reference to a proxy
      draft[1] = draft[3];
      draft[3] = e1;
      draft[4] = e0;
      draft[0].a = 55;
    });
    expect(myObj).not.toBe(result);
    expect(result[0]).not.toBe(myObj[0]);
    expect(result[1]).not.toBe(myObj[1]);
    expect(result[2]).toBe(myObj[2]);
    expect(result[3]).toBe(myObj[1]);
    expect(result[1]).toBe(myObj[3]);
    // before, it failed because we didn't cycle through all of the parents
    expect(result[0].a).toBe(55);
    // this would fail with current version of immer, it would give 11;
    // result[4] is a reference to draft[0], so if we assign 55 it can't be 11
    expect(result[4].a).toBe(55);
  });
  it("simple switch", async () => {
    const myObj = [{ a: 0 }, { a: 1 }];
    const result = produce(myObj, (draft) => {
      draft[0] = draft[1];
      draft[0].a = 2;
    });
    expect(myObj).not.toBe(result);
    expect(result[0].a).toBe(2);
    expect(result[1].a).toBe(2);
  });
  it("simple switch reverse", async () => {
    const myObj = [{ a: 0 }, { a: 1 }];
    const result = produce(myObj, (draft) => {
      draft[1] = draft[0];
      draft[0].a = 2;
    });
    expect(myObj).not.toBe(result);
    expect(result[0].a).toBe(2);
    expect(result[1].a).toBe(2);
  });
  it("does not create problems if we modify the object after transposition", async () => {
    const state = [[1], [2]];
    const newState = produce(state, (draft) => {
      const first = draft[0];
      draft[0] = draft[1];
      draft[1] = first;
      first.push(9999);
    });
    expect(newState[0]).toEqual([2]);
    expect(newState[1]).toEqual([1, 9999]);
  });
  it("does not create problems if we modify the object before transposition", async () => {
    const state = [[1], [2]];
    const newState = produce(state, (draft) => {
      const first = draft[0];
      first.push(9999);
      draft[0] = draft[1];
      draft[1] = first;
    });
    expect(newState[0]).toEqual([2]);
    expect(newState[1]).toEqual([1, 9999]);
  });
});
