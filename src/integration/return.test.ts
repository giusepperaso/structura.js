import { describe, expect, it } from "vitest";
import { Obj2, isProxy } from "./utils";
import { produceTest as produce } from "./utils";

describe.concurrent("try returning directly from the producer", async () => {
  it("can return the same type", async () => {
    const myObj: Obj2<number>[] = [
      {
        prop: {
          sub: 1,
        },
      },
    ];
    const result = produce(myObj, (draft) => {
      return [
        {
          prop: {
            sub: draft[0].prop.sub + 1,
          },
        },
      ];
    });
    expect(myObj).not.toBe(result);
    expect(result[0].prop.sub).toBe(2);
  });
  it("can return a different type", async () => {
    const myObj: { prop: { sub: number } }[] = [
      {
        prop: {
          sub: 1,
        },
      },
    ];
    const result = produce(myObj, (draft) => {
      return {
        prop: {
          sub: "test" + draft[0].prop.sub,
        },
      };
    });
    expect(myObj).not.toBe(result);
    expect(result.prop.sub).toBe("test1");
  });
  it("can return and modify the draft in the same producer", async () => {
    const myObj: Obj2<number>[] = [
      {
        prop: {
          sub: 1,
        },
      },
    ];
    const result = produce(myObj, (draft) => {
      draft[0].prop.sub++;
      return draft[0];
    });
    expect(myObj).not.toBe(result);
    expect(myObj[0]).not.toBe(result);
    expect(result.prop.sub).toBe(2);
  });
  it("can return part of itself by keeping the reference", async () => {
    const myObj: Obj2<number>[] = [
      {
        prop: {
          sub: 1,
        },
      },
    ];
    const result = produce(myObj, (draft) => {
      const obj = draft[0];
      return obj;
    });
    expect(myObj).not.toBe(result);
    expect(isProxy(result)).toBe(false);
    expect(myObj[0]).toBe(result);
  });
});
