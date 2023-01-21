import { expect } from "vitest";
import { applyPatches, original, ProduceParams, produceWithPatches } from "..";
import {} from "..";

export type Obj<T = unknown> = { [key: string]: T };
export type Obj2<T = unknown> = Obj<Obj<T>>;

export function isProxy(obj: unknown) {
  return original(obj) !== obj;
}

export function produceTest<T extends object>(
  ...args: [ProduceParams<T>[0], ProduceParams<T>[1]]
) {
  const [result, patches, reverse] = produceWithPatches(...args);
  expect(result).toEqual(applyPatches(args[0], patches));
  expect(args[0]).toEqual(applyPatches(result, reverse));
  return result;
}
