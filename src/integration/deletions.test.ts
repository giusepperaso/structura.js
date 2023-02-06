import { describe, expect, it } from "vitest";
import { produceTest as produce } from "./utils";

describe.concurrent(
  "deletions should work as expected in objects and array",
  () => {
    it("should delete and the in operator should work also inside the producer", async () => {
      const myObj: { test?: number[] } = { test: [1] };
      const result = produce(myObj, (draft) => {
        delete draft.test;
        expect(draft.test).toBe(undefined);
        expect("test" in draft).toBe(false);
      });
      expect(result.test).toBe(undefined);
      expect("test" in result).toBe(false);
    });
  }
);
