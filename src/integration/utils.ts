import { expect, describe, beforeAll } from "vitest";
import {
  applyPatches,
  convertPatchesToStandard as convert,
  enableAutoFreeze,
  enableStrictCopy,
  Producer,
  produceWithPatches,
  target,
} from "..";

export type Obj<T = unknown> = { [key: string]: T };
export type Obj2<T = unknown> = Obj<Obj<T>>;

// by using this helper, we also test for patches and reverse patches

export function produceTest<T extends object, Q>(
  state: T,
  producer: Producer<T, Q>
) {
  const [result, patches, reverse] = produceWithPatches(state, producer);
  expect(result).toEqual(applyPatches(state, patches));
  expect(target(state)).toEqual(applyPatches(result, reverse));
  expect(result).toEqual(applyPatches(state, convert(patches)));
  expect(target(state)).toEqual(applyPatches(result, convert(reverse)));
  return result;
}

export function runMultiple(description: string, testFn: Function) {
  describe.concurrent.each([
    { autoFreeze: false, strictCopy: false },
    { autoFreeze: true, strictCopy: false },
    { autoFreeze: false, strictCopy: true },
    //{ autoFreeze: true, strictCopy: true },
  ])(
    description + " ( autoFreeze: $autoFreeze, strictCopy: $strictCopy )",
    ({ autoFreeze, strictCopy }) => {
      // beforeAll must be called here inside because it must work for the single describe block
      beforeAll(() => {
        enableAutoFreeze(autoFreeze);
        enableStrictCopy(strictCopy);
      });
      testFn();
    }
  );
}

// we add the flag DEBUG just so we can set it to true and debug something just in case

declare global {
  var DEBUG: boolean;
}
