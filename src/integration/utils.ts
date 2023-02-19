import { expect } from "vitest";
import {
  applyPatches,
  convertPatchesToStandard as convert,
  original,
  Producer,
  produceWithPatches,
} from "..";

export type Obj<T = unknown> = { [key: string]: T };
export type Obj2<T = unknown> = Obj<Obj<T>>;

export function isProxy(obj: unknown) {
  return original(obj) !== obj;
}

// by using this helper, we also test for patches and reverse patches

export function produceTest<T extends object, Q>(
  state: T,
  producer: Producer<T, Q>
) {
  const [result, patches, reverse] = produceWithPatches(state, producer);
  expect(result).toEqual(applyPatches(state, patches));
  expect(state).toEqual(applyPatches(result as object, reverse));
  expect(result).toEqual(applyPatches(state, convert(patches)));
  expect(state).toEqual(applyPatches(result as object, convert(reverse)));
  return result;
}

// we add the flag DEBUG just so we can set it to true and debug something just in case

declare global {
  var DEBUG: boolean;
}
