import { describe, expect, it } from "vitest";
import {
  DraftableTypes,
  Settings,
  allData,
  enableAutoFreeze,
  enableStandardPatches,
  enableStrictCopy,
  freeze,
  isDraftable,
  isPrimitive,
  itemData,
  original,
  produce,
  snapshot,
  toStringArchtype,
  unfreeze,
} from "../..";

describe.concurrent("unit tests for helpers", () => {
  it("freeze on maps throws an error", async () => {
    expect(function () {
      //@ts-expect-error map is readonly
      freeze(new Map(), true).set("test", 11);
    }).toThrowError();
  });
  it("freeze on sets and set throws an error", async () => {
    expect(function () {
      //@ts-expect-error map is readonly
      freeze(new Set(), true).add("test");
    }).toThrowError();
  });
  it("unfreeze throws if the object is frozen", async () => {
    expect(() => unfreeze(Object.freeze({}))).toThrowError();
  });
  it("unfreeze returns the object", async () => {
    const obj = {};
    expect(unfreeze(obj)).toBe(obj);
  });
  it("dratable types should be", async () => {
    expect(Array.isArray(DraftableTypes)).toBe(true);
  });
  it("functions are draftable", async () => {
    expect(isDraftable(function () {})).toBe(true);
  });
  it("to string archtype", async () => {
    expect(toStringArchtype("")).toBe("primitive");
  });
  it("to string archtype", async () => {
    expect(toStringArchtype(function () {})).toBe("function");
    expect(toStringArchtype(function () {})).toBe("function");
  });
  it("is primitive", async () => {
    expect(isPrimitive(null)).toBe(true);
  });
  it("test settings", async () => {
    enableAutoFreeze(true);
    enableStandardPatches(true);
    enableStrictCopy(true);
    expect(Settings.autoFreeze).toBe(true);
    expect(Settings.standardPatches).toBe(true);
    expect(Settings.strictCopy).toBe(true);
    enableAutoFreeze(false);
    enableStandardPatches(false);
    enableStrictCopy(false);
    expect(Settings.autoFreeze).toBe(false);
    expect(Settings.standardPatches).toBe(false);
    expect(Settings.strictCopy).toBe(false);
  });
  it("snapshot on nested objects should work", () => {
    const obj = { n: { t: { a: 2 } } };
    produce(obj, (d) => {
      d.n.t.a = 1;
      const s = snapshot(d);
      s;
    });
  });
  it("test snapshot on maps and sets", async () => {
    produce(new Map([["test", 1]]), (draft) => {
      draft.set("test2", 2);
      expect(snapshot(draft).get("test")).toBe(1);
    });
    produce(new Set([1]), (draft) => {
      draft.add(2);
      expect([...snapshot(draft).values()][0]).toBe(1);
    });
  });
  it("snapshot on non drafts should return the object", () => {
    const obj = {};
    expect(snapshot(obj)).toBe(obj);
  });
  it("itemData and allData helpers should work", () => {
    produce({}, (draft) => {
      expect(!!itemData(draft)!.original).toBe(true);
      expect(!!allData(draft)!.get(original(draft))!.original).toBe(true);
    });
  });
  it("helpers don't work on undef values", () => {
    expect(typeof itemData(undefined)).toBe("undefined");
    expect(typeof allData(undefined)).toBe("undefined");
    expect(typeof original(undefined)).toBe("undefined");
  });
});
