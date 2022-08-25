import { vi, describe, expect, it } from "vitest";
import { produce, createProxy } from "..";

describe.concurrent("proxify tests", () => {
  it("should not proxify methods because it's useless", async () => {
    const _ = { createProxy };
    const proxify = vi.spyOn(_, "createProxy");
    const myObj = [0, 1];
    const result = produce(
      myObj,
      (draft) => {
        draft.push(0);
      },
      { proxify }
    );
    expect(proxify).not.toHaveBeenCalledWith(myObj.push);
    expect(result.push).toBe(myObj.push);
  });
});
