import { expect, it } from "vitest";
import { asyncProduce, produce as plainProduce } from "../..";
import { produceTest as produce } from "./utils";
import { Obj, Obj2, runMultiple } from "./utils";

runMultiple("tests all(most) of the basic types", () => {
  it("works with primitives as root", async () => {
    const myObj = 1;
    const result = plainProduce(myObj, (draft) => {
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
  it("works with class instances", async () => {
    class Test {
      prop = 1;
    }
    const test = new Test();
    const result = produce(test, (draft) => {
      draft.prop++;
    });
    expect(test).not.toBe(result);
    expect(test.prop).toBe(1);
    expect(result.prop).toBe(2);
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
    expect(Array.isArray(result[4])).toBe(true);
    expect(Array.isArray(result)).toBe(true);

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
  it("array splice to work well", async () => {
    const myObj = { test1: [0, 1, 2] };
    const result = produce(myObj, (draft) => {
      draft.test1.splice(1, 1);
      expect(draft.test1).toEqual([0, 2]);
    });
    expect(result.test1).toEqual([0, 2]);
  });
  it("works with null", async () => {
    const result = plainProduce(null, (state) => {
      if (typeof state === "number") {
        return state - 2;
      }
      return undefined;
    });
    expect(result).toBe(undefined);
  });
  it("works with dates", async () => {
    const myDate = {a:new Date()};

    const result = produce(myDate, (draft) => {
      draft.a.setSeconds(draft.a.getSeconds() + 1);
      draft.a.setSeconds(draft.a.getSeconds() + 1);

      expect((new Date(draft.a)).toString()).toBe(draft.a.toString()); // compare to the second, since the constructor will drop milliseconds
    });

    expect(myDate.a.getTime()).not.toBe(result.a.getTime());
    expect(myDate.a.getTime()).toBe(result.a.getTime() - 2000);
  });
  it("works with async producers", async () => {
    const result = await asyncProduce({ n: 1 }, async (draft) => {
      draft.n = 2;
    });
    expect(result.n).toBe(2);
  });
  // regexp, date etc...
});
