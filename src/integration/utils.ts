import { expect } from "vitest";
import { applyPatches, original, Producer, produceWithPatches } from "..";
import {} from "..";

export type Obj<T = unknown> = { [key: string]: T };
export type Obj2<T = unknown> = Obj<Obj<T>>;

export function isProxy(obj: unknown) {
  return original(obj) !== obj;
}

export function produceTest<T extends object, Q>(
  state: T,
  producer: Producer<T, Q>
) {
  const [result, patches, reverse] = produceWithPatches(state, producer);
  expect(result).toEqual(applyPatches(state, patches));
  expect(state).toEqual(applyPatches(result as object, reverse));
  return result;
}

declare global {
  var DEBUG: boolean;
}
