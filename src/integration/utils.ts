import { expect } from "vitest";
import { applyPatches, original, Producer, produceWithPatches } from "..";
import {} from "..";

export type Obj<T = unknown> = { [key: string]: T };
export type Obj2<T = unknown> = Obj<Obj<T>>;

export function isProxy(obj: unknown) {
  return original(obj) !== obj;
}

export function produceTest<T extends object, Q>(...args: [T, Producer<T, Q>]) {
  const [result, patches, reverse] = produceWithPatches(...args);
  expect(result).toEqual(applyPatches(args[0], patches));
  expect(args[0]).toEqual(applyPatches(result as object, reverse));
  return result;
}
