import { describe, expect, it } from "vitest";
import { enableStrictCopy, produce } from "..";

describe.concurrent(
  "verify that everything is working also with settings enabled",
  () => {
    it("also works with enabledStrictCopy", async () => {
      enableStrictCopy(true);
      const myObj = { test1: [1] };
      const result = produce(myObj, (draft) => {
        draft.test1.push(1);
      });
      expect(result).not.toBe(myObj);
      expect(result.test1).not.toBe(myObj.test1);
      enableStrictCopy(false);
    });
  }
);
