import { describe, expect, it } from "vitest";
import { produce } from "..";
import { Obj, Obj2 } from "./utils";

describe.concurrent("tests all(most) of the basic types", () => {
  it("works with primitives as root", async () => {
    const myObj = 1;
    const result = produce(myObj, (draft) => {
      draft *= 2;
      draft++;
      return draft; // it can only work by returning the draft!
    });
    expect(myObj).toBe(1);
    expect(result).toBe(3);
  });
  it("works with json-like objects", async () => {
    const myObj = {
      prop: {
        sub: "test",
      },
      prop2: {
        sub: 1,
      },
      prop3: "",
      prop4: "test",
    };
    const result = produce(myObj, (draft) => {
      draft.prop2.sub = 3;
      draft.prop3 = draft.prop.sub;
      const s = draft.prop4.split("");
      s[1] = "3";
      draft.prop4 = s.join("");
      draft.prop4 += "a";
      draft.prop4 += "a";
    });
    expect(myObj).not.toBe(result);
    expect(result.prop2.sub).toBe(3);
    expect(result.prop3).toBe(myObj.prop.sub);
    expect(result.prop4).toBe("t3staa");
    expect(myObj.prop4).toBe("test");

    const result2 = produce(result, (draft) => {
      draft.prop2.sub = 3;
    });

    produce(result2, (draft) => {
      draft.prop2.sub = 3;
    });
  });
  it("works with arrays", async () => {
    const myObj = [
      {
        prop: {
          sub: 1,
        },
      },
      {
        prop: {
          sub: 2,
        },
      },
      [{ prop: { sub: 3 } }],
      {},
      [],
    ];
    const result = produce(myObj, (draft) => {
      (draft[0] as Obj2).prop.sub = "test";
      (draft[1] as Obj2).prop.sub = null;
      (draft[2] as Obj2<number>[])[0].prop.sub++;
      (draft[2] as Obj2<number>[])[0].prop.sub++;
      (draft[2] as Obj2<number>[])[0].prop.sub *= 2;
      (draft[4] as number[]).push(0);
      (draft[4] as number[]).push(1);
      (draft[4] as number[]).push(2);
    });
    expect(myObj).not.toBe(result);
    expect(result[0]).not.toBe(myObj[0]);
    expect(result[1]).not.toBe(myObj[1]);
    expect(result[2]).not.toBe(myObj[2]);
    expect(result[3]).toBe(myObj[3]);
    expect((result[0] as Obj2).prop.sub).not.toBe((myObj[0] as Obj2).prop.sub);
    expect((result[0] as Obj2).prop.sub).toBe("test");
    expect((result[2] as Obj[])[0]).not.toBe((myObj[2] as Obj[])[0]);
    expect((myObj[2] as Obj2[])[0].prop.sub).toBe(3);
    expect((result[2] as Obj2[])[0].prop.sub).toBe(10);
    expect(result[4]).toEqual([0, 1, 2]);
    expect((result[4] as number[]).length).toBe(3);

    const result2 = produce(result, (draft) => {
      draft.push([]);
    });
    produce(result2, (draft) => {
      draft.push([]);
    });
  });
  it("array push to work well", async () => {
    const myObj = { test1: [1] };
    const result = produce(myObj, (draft) => {
      draft.test1.push(1);
    });
    expect(result.test1).not.toBe(myObj.test1);
  });
  // regexp, date etc...
});
