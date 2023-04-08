import { describe, test } from "vitest";
import { safeProduce } from "../../";

describe("safe produce", () => {
  test("safe produce should not allow a different return type", () => {
    // @ts-expect-error return type is different
    safeProduce({ n: 1 }, (d) => {
      d.n++;
      return [];
    });
  });
});
