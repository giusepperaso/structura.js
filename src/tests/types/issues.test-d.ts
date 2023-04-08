import { describe, test } from "vitest";
import { Patch } from "../../core/patches";
import { Producer, produce, produceWithPatches } from "../../";
import { FreezeOnce } from "../../helpers/freeze";

describe("check solved issues", () => {
  test("issue #91 should be solved", () => {
    //https://github.com/giusepperaso/structura.js/issues/91
    const convertPatchesToDiff = <TState extends { t: number }>(
      initialState: FreezeOnce<TState>,
      _transactions: Patch[][],
      derivateFn: Producer<TState, void>
    ) => {
      const _example = produce(initialState, derivateFn);
      _example;
      const [initialDerivedState, _initialRevertDerivation] =
        produceWithPatches(initialState, derivateFn);
      const [initialDerivedState2, _initialRevertDerivation2] =
        produceWithPatches(initialDerivedState, derivateFn);
      const [_initialDerivedState3, _initialRevertDerivation3] =
        produceWithPatches(initialDerivedState2, derivateFn);
    };

    const [_b] = produceWithPatches({}, () => {});
    const [_c] = produceWithPatches(_b, () => {});
    const [_d] = produceWithPatches(_c, () => {});

    const convertPatchesToDiff2 = <TState extends {}>(
      initialState: FreezeOnce<TState>,
      _transactions: Patch[][],
      derivateFn: Producer<TState, void>
    ) => {
      const [_initialDerivedState, , _initialRevertDerivation] =
        produceWithPatches(
          initialState, // <-- in previous versions, a casting here was necessary
          derivateFn
        );
    };
    convertPatchesToDiff;
    convertPatchesToDiff2;
  });
});
