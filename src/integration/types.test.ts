import { describe, expect, it } from "vitest";
import { produce } from "..";
import { Obj, Obj2 } from "./utils";

import { produce as immer } from "immer";

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
  it("works with arrays traspositions", async () => {
    const myObj = [{ a: 0 }, { a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }];
    const result = produce(myObj, (draft) => {
      draft[0].a = 11;
      draft.reverse();
      draft.reverse();
      draft.reverse();
      draft[0].a = 55;
    });
    expect(myObj).not.toBe(result);
    expect(result[0]).not.toBe(myObj[0]);
    expect(result[1]).not.toBe(myObj[1]);
    expect(result[2]).toBe(myObj[2]);
    expect(result[3]).toBe(myObj[1]);
    expect(result[1]).toBe(myObj[3]);
    expect(result[0].a).toBe(55);
    expect(result[4].a).toBe(11);
  });
  it("reverse manual", async () => {
    const myObj = [{ a: 0 }, { a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }];
    const result = produce(myObj, (draft) => {
      draft[0].a = 11;
      const e0 = draft[0];
      const e1 = draft[1];
      const tt = (draft[0] = draft[4]);
      //tt.a = 5; // se faccio questo allora result[4] = 11
      // inoltre il 5 viene ignorato
      // questo perchè è vero che io assegno l'originale, ma tt è un proxy
      // però non capisco l'11
      draft[1] = draft[3];
      draft[3] = e1;
      draft[4] = e0;
      draft[0].a = 55;
    });
    expect(myObj).not.toBe(result);
    expect(result[0]).not.toBe(myObj[0]);
    expect(result[1]).not.toBe(myObj[1]);
    expect(result[2]).toBe(myObj[2]);
    expect(result[3]).toBe(myObj[1]);
    expect(result[1]).toBe(myObj[3]);
    // before, it failed because we didn't cycle through all of the parents
    expect(result[0].a).toBe(55);
    // this would fail with current version of immer, it would give 11;
    // result[4] is a reference to draft[0], so if we assign 55 it can't be 11
    expect(result[4].a).toBe(55);
  });
  it("simple switch", async () => {
    const myObj = [{ a: 0 }, { a: 1 }];
    const result = produce(myObj, (draft) => {
      draft[0] = draft[1];
      draft[0].a = 2;
    });
    expect(myObj).not.toBe(result);
    expect(result[0].a).toBe(2);
    expect(result[1].a).toBe(2); // OK
  });
  it("simple switch reverse", async () => {
    const myObj = [{ a: 0 }, { a: 1 }];
    const result = produce(myObj, (draft) => {
      draft[1] = draft[0];
      draft[0].a = 2;
    });
    expect(myObj).not.toBe(result);
    expect(result[0].a).toBe(2); // OK
    expect(result[1].a).toBe(2);
  });
  it("reverse manual immer", async () => {
    const myObj = [{ a: 0 }, { a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }];
    const result = immer(myObj, (draft) => {
      draft[0].a = 11;
      const e0 = draft[0];
      const e1 = draft[1];
      draft[0] = draft[4];
      draft[1] = draft[3];
      draft[3] = e1;
      draft[4] = e0;
      draft[0].a = 55;
    });
    expect(myObj).not.toBe(result);
    expect(result[0]).not.toBe(myObj[0]);
    expect(result[1]).not.toBe(myObj[1]);
    expect(result[2]).toBe(myObj[2]);
    expect(result[3]).toBe(myObj[1]);
    expect(result[1]).toBe(myObj[3]);
    expect(result[0].a).toBe(55); // qui mi da l'oggetto originale cioe con 4 in quanto non viene mai modificato
    expect(result[4].a).toBe(11); // in questo caso mi da lo shallow, a cui poi assegno 55
  });
  it("traspose manual", async () => {
    const myObj = [{ a: 0 }, { a: { b: 1 } }, { a: 2 }, { a: 3 }, { a: 4 }];
    const result = produce(myObj, (draft) => {
      const e1 = draft[1];
      draft[3] = e1;
    });
    expect((result[3] as any).b).toBe((myObj[1] as any).b);
    //expect(result[3]).toBe(myObj[1]);
    //expect(result[1]).toBe(myObj[3]);
  });
  // regexp etc...
});
