import { expect, it } from "vitest";
import {
  applyPatches,
  asyncProduceWithPatches,
  Patch,
  produceWithPatches,
} from "../..";
import { runMultiple } from "./utils";

runMultiple("test patch production", () => {
  it("should return the right patches on array push", async () => {
    const myObj: number[][] = [[], [], [], []];
    const [result, patches] = produceWithPatches(myObj, (draft) => {
      draft[0].push(0);
      draft[0].push(1);
      draft[0].push(2);
    });
    expect(result[0]).not.toBe(myObj[0]);
    expect(patches).toEqual([
      {
        p: "0",
        op: 9,
        next: [
          { v: 0, p: "0", op: 0 },
          { v: 1, p: "length", op: 0 },
        ],
      },
      {
        p: "0",
        op: 9,
        next: [
          { v: 1, p: "1", op: 0 },
          { v: 2, p: "length", op: 0 },
        ],
      },
      {
        p: "0",
        op: 9,
        next: [
          { v: 2, p: "2", op: 0 },
          { v: 3, p: "length", op: 0 },
        ],
      },
    ] as Patch[]);
  });
  it("should return the right patches on array manual adding", async () => {
    const myObj: number[][] = [[], [], [], []];
    const [result, patches] = produceWithPatches(myObj, (draft) => {
      draft[0][0] = 0;
      draft[0][1] = 1;
      draft[0][2] = 2;
    });
    expect(result[0]).not.toBe(myObj[0]);
    expect(patches).toEqual([
      { p: "0", op: 9, next: [{ v: 0, p: "0", op: 0 }] },
      { p: "0", op: 9, next: [{ v: 1, p: "1", op: 0 }] },
      { p: "0", op: 9, next: [{ v: 2, p: "2", op: 0 }] },
    ] as Patch[]);
  });
  it("should return the right patches on object set", async () => {
    const myObj: { [k: string]: number }[] = [{ A: 1 }];
    const [result, patches] = produceWithPatches(myObj, (draft) => {
      draft[0].B = 2;
      draft[0].C = 3;
      draft[0].D = 4;
      draft[0].E = 5;
    });
    expect(result[0]).not.toBe(myObj[0]);
    expect(patches).toEqual([
      { p: "0", op: 9, next: [{ v: 2, p: "B", op: 0 }] },
      { p: "0", op: 9, next: [{ v: 3, p: "C", op: 0 }] },
      { p: "0", op: 9, next: [{ v: 4, p: "D", op: 0 }] },
      { p: "0", op: 9, next: [{ v: 5, p: "E", op: 0 }] },
    ] as Patch[]);
  });
  it("should apply the patches correctly with object/array", async () => {
    const makeObj: () => { [k: string]: number }[] = () => [{ A: 1 }];
    const myObj = makeObj();
    const [, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
      delete draft[0].A;
      draft[0].B = 2;
      draft.push({ C: 3 });
    });
    const result = applyPatches(myObj, patches);
    expect(result).toEqual([{ B: 2 }, { C: 3 }]);
    const undone = applyPatches(result, inverse);
    expect(undone).toEqual(makeObj());
  });
  it("should apply the patches correctly with array reverse", async () => {
    const makeObj: () => { [k: string]: number }[] = () => [{ A: 1 }, { A: 2 }];
    const myObj = makeObj();
    const [, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
      draft.reverse();
    });
    const result = applyPatches(myObj, patches);
    expect(result).toEqual([{ A: 2 }, { A: 1 }]);
    const undone = applyPatches(result, inverse);
    expect(undone).toEqual(makeObj());
  });
  it("should apply the patches correctly with array splice", async () => {
    const makeObj: () => { [k: string]: number }[] = () => [{ A: 1 }, { A: 4 }];
    const myObj = makeObj();
    const [, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
      draft.splice(1, 0, { A: 2 }, { A: 3 });
    });
    const result = applyPatches(myObj, patches);
    expect(result).toEqual([{ A: 1 }, { A: 2 }, { A: 3 }, { A: 4 }]);
    const undone = applyPatches(result, inverse);
    expect(undone).toEqual(makeObj());
  });
  it("should apply the patches correctly with producer return", async () => {
    const makeObj: () => number[] = () => [0];
    const myObj = makeObj();
    const [, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
      return [draft[0], 1];
    });
    const result = applyPatches(myObj, patches);
    expect(result).toEqual([0, 1]);
    const undone = applyPatches(result, inverse);
    expect(undone).toEqual(makeObj());
  });
  it("should apply the patches correctly with map", async () => {
    const makeObj: () => Map<string, number>[] = () => [new Map()];
    const myObj = makeObj();
    const [, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
      draft[0].set("A", 1);
    });
    const result = applyPatches(myObj, patches);
    expect(result).toEqual([new Map([["A", 1]])]);
    const undone = applyPatches(result, inverse);
    expect(undone).toEqual(makeObj());
  });
  it("should apply the patches correctly with set", async () => {
    const makeObj: () => Set<{ [k: string]: number }>[] = () => [new Set()];
    const myObj = makeObj();
    const [, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
      draft[0].add({ A: 1 });
    });
    const result = applyPatches(myObj, patches);
    expect(result).toEqual([new Set([{ A: 1 }])]);
    const undone = applyPatches(result, inverse);
    expect(undone).toEqual(makeObj());
  });
  it("should apply the patches correctly with map clear", async () => {
    const makeObj: () => Map<string, number> = () =>
      new Map([
        ["A", 1],
        ["B", 2],
        ["C", 3],
      ]);
    const myObj = makeObj();
    const [, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
      draft.clear();
    });
    const result = applyPatches(myObj, patches);
    expect(result).toEqual(new Map());
    const undone = applyPatches(result, inverse);
    expect(undone).toEqual(makeObj());
  });
  it("should apply the patches correctly with set clear", async () => {
    // attention! : if the objects referred are not the same, this will not work!
    const base = [{ A: 1 }, { A: 2 }, { A: 3 }];
    const makeObj: () => Set<{ [k: string]: number }> = () => new Set(base);
    const myObj = makeObj();
    const [, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
      draft.clear();
    });
    const result = applyPatches(myObj, patches);
    expect(result).toEqual(new Set());
    const undone = applyPatches(result, inverse);
    expect(undone).toEqual(makeObj());
  });
  it("should return patches also with primitives", async () => {
    const [result, patches, rev] = produceWithPatches(2, (draft) => draft + 2);
    expect(result).toBe(4);
    expect(!!patches).toBe(true);
    expect(!!rev).toBe(true);
    expect(patches[0].v).toBe(4);
    expect(rev[0].v).toBe(2);
  });
  it("works with async producers with patches", async () => {
    const [result, patches, reverse] = await asyncProduceWithPatches(
      { n: 1 },
      async (draft) => {
        draft.n = 2;
      }
    );
    expect(result.n).toBe(2);
    expect(Array.isArray(patches)).toBe(true);
    expect(Array.isArray(reverse)).toBe(true);
  });
});
