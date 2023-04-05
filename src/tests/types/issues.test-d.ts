import { test } from "vitest";
import { Patch } from "../../core/patches";
import { Producer, produce, produceWithPatches } from "../../core/produce";
import { FreezeOnce } from "../../helpers/freeze";

test("issue #91 should be solved", () => {
  //https://github.com/giusepperaso/structura.js/issues/91
  const convertPatchesToDiff = <TState extends { t: number }>(
    initialState: FreezeOnce<TState>,
    transactions: Patch[][],
    //derivateFn: (state: TState) => void
    derivateFn: Producer<TState, void>
  ) => {
    //initialState.t=1
    const aaa = produce(initialState, derivateFn);
    const [initialDerivedState, initialRevertDerivation] = produceWithPatches(
      initialState,
      derivateFn
    );
    const [initialDerivedState2, initialRevertDerivation2] = produceWithPatches(
      initialDerivedState,
      derivateFn
    );
    const [initialDerivedState3, initialRevertDerivation3] = produceWithPatches(
      initialDerivedState2,
      derivateFn
    );
  };

  const [b] = produceWithPatches({}, () => {});
  const [c] = produceWithPatches(b, () => {});
  const [d] = produceWithPatches(c, () => {});

  const convertPatchesToDiff2 = <TState extends {}>(
    initialState: FreezeOnce<TState>,
    transactions: Patch[][],
    derivateFn: Producer<TState, void>
  ) => {
    const [initialDerivedState, , initialRevertDerivation] = produceWithPatches(
      initialState, // <-- this casting shouldn't be necessary in future versions
      derivateFn
    );
  };
});
