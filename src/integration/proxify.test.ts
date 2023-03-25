import { vi, expect, it } from "vitest";
import { produce, createProxy, CreateProxy } from "..";
import { runMultiple } from "./utils";

runMultiple("proxy and traps tests", async () => {
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
  it("the in operator should work also inside the producer", async () => {
    const myObj: { test?: number[] } = { test: [1] };
    const result = produce(myObj, (draft) => {
      delete draft.test;
      expect(draft.test).toBe(undefined);
      expect("test" in draft).toBe(false);
    });
    expect(result.test).toBe(undefined);
    expect("test" in result).toBe(false);
  });
  it("Object keys inside the producer should return the draft keys", async () => {
    const myObj: Record<string, number> = { test: 1 };
    produce(myObj, (draft) => {
      delete draft.test;
      draft.test2 = 3;
      expect(Object.keys(draft)).toEqual(["test2"]);
    });
  });
  it("Object keys works after adding properties", async () => {
    produce({ t1: 1 } as Record<string, number>, (draft) => {
      expect(Reflect.ownKeys(draft)).toEqual(["t1"]);
      draft.t2 = 2;
      expect(Reflect.ownKeys(draft)).toEqual(["t1", "t2"]);
      expect("t2" in draft).toBeTruthy();
      draft.t3 = 3;
      expect(Reflect.ownKeys(draft)).toEqual(["t1", "t2", "t3"]);
      expect("t3" in draft).toBeTruthy();
      expect(Object.keys(Object.assign({}, draft))).toEqual(["t1", "t2", "t3"]);
      expect(Object.keys(Object.assign(draft, { t4: 4 }))).toEqual([
        "t1",
        "t2",
        "t3",
        "t4",
      ]);
    });
  });
});
