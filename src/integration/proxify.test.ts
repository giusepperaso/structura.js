import { vi, describe, expect, it } from "vitest";
import { produce, createProxy, CreateProxy } from "..";

describe.concurrent("proxify tests", async () => {
  it("should not proxify methods because it's useless", async () => {
    const _ = { createProxy };
    const proxify = vi.spyOn(_, "createProxy") as unknown as CreateProxy;
    const myObj = [0, 1];
    const result = produce(
      myObj,
      (draft) => {
        draft.push(0);
      },
      undefined,
      { proxify }
    );
    expect(proxify).not.toHaveBeenCalledWith(myObj.push);
    expect((result as any).push).toBe(myObj.push);
  });
});
