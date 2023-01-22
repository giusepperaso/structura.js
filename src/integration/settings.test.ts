import { describe, expect, it } from "vitest";
import { enableStrictCopy } from "..";
import { produceTest as produce } from "./utils";

describe.concurrent(
  "verify that everything is working also with settings enabled",
  () => {
    it("also works with enabledStrictCopy", async () => {
      enableStrictCopy(true);
      const symbol = Symbol();
      const myObj = { test1: [1], [symbol]: "test" };
      const result = produce(myObj, (draft) => {
        draft.test1.push(1);
        draft[symbol] = "test2";
      });
      expect(result).not.toBe(myObj);
      expect(result.test1).not.toBe(myObj.test1);
      expect(result[symbol]).not.toBe(myObj[symbol]);
      enableStrictCopy(false);
    });
  }
);
