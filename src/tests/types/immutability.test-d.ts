import { describe, test } from "vitest";
import { produce } from "../../";
import { FreezeOnce, UnFreeze } from "../../helpers/freeze";

describe("results should be staticly immutable", () => {
  test("result is immutable", () => {
    const result = produce({ n: 1 }, (d) => {
      d.n = 2;
    });
    // @ts-expect-error result is immutable
    result.n = 3;
  });
  test("nested result is immutable", () => {
    const m: FreezeOnce<Map<string, { n: { n: number } }>> = new Map([
      ["sd", { n: { n: 1 } }],
    ]);
    // @ts-expect-error nested result is immutable
    m.get("sd").n.n++;
  });
  test("multiple results are immutable", () => {
    const myObj: FreezeOnce<{ n: number }> = { n: 1 };
    // @ts-expect-error should be immutable
    myObj.n++;
    const result1 = produce(myObj, (draft) => {
      draft.n++;
    });
    // @ts-expect-error should be immutable
    result1.n++;
    (result1 as UnFreeze<{ n: number }>).n++;

    const result2 = produce(result1, (draft) => {
      draft.n++;
    });
    const result3 = produce(result2, (draft) => {
      draft.n++;
    });
    // @ts-expect-error should be immutable
    result3.n++;
    const result4 = produce(result3, (draft) => {
      draft.n++;
    });
    result4;
  });
});
