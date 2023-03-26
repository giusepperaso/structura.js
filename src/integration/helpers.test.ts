import { expect, it } from "vitest";
import { freeze, original, produce, snapshot } from "..";
import { runMultiple } from "./utils";

runMultiple("helpers work as expected", () => {
  it("snapshot helper works as expected, before and after modification", async () => {
    const myObj = { t: [0], t2: {} };
    produce(myObj, (draft) => {
      const _original = original(draft);

      let _snapshot = snapshot(draft);
      expect(_snapshot).toBe(_original);
      expect(_snapshot.t).toBe(_original.t);
      expect(_snapshot.t2).toBe(_original.t2);

      draft.t.push(1);

      _snapshot = snapshot(draft);
      expect(_snapshot).not.toBe(_original);
      expect(_snapshot.t).not.toBe(_original.t);
      expect(_snapshot.t2).toBe(_original.t2);
    });
  });
  it("freezes everything", async () => {
    expect(Object.isFrozen(freeze({}, true, true))).toBe(true);
    expect(Object.isFrozen(freeze([], true, true))).toBe(true);
    expect(Object.isFrozen(freeze(new Map([[{}, []]]), true, true))).toBe(true);
  });
});
