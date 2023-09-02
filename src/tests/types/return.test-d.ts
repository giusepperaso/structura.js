import { test, expectTypeOf, describe } from "vitest";
import { produce } from "../../";

describe("check the return type of the result", () => {
  test("should return the same type", () => {
    const obj = { n: 1 };
    const result = produce(obj, (draft) => {
      draft.n++;
    });
    expectTypeOf(result).toMatchTypeOf(obj);
  });
  test("should return the type of the returned object if different", () => {
    const obj = { sub: { n: 1 } };
    const result = produce(obj, (draft) => {
      draft.sub.n++;
      return draft.sub;
    });
    expectTypeOf(result).toMatchTypeOf(obj.sub);
  });
  test("should allow calling methods on both draft and the returned object", () => {
    const obj = { date: new Date(), time: 0 };
    const result = produce(obj, (draft) => {
      draft.time = draft.date.getTime();
    });
    expectTypeOf(result.date.getTime()).toMatchTypeOf(1);
  });
});
