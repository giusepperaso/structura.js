import { describe, expect, it } from "vitest";
import { Obj } from "./utils";
import { produceTest as produce } from "./utils";

describe.concurrent(
  "verify that object references change (or remain the same) accordingly with shallow cloning rules",
  () => {
    it("should not modify objects if no modifications happen", async () => {
      const myObj = {
        prop: {
          sub: {},
        },
      };
      const result = produce(myObj, (draft) => {
        draft.prop.sub;
      });
      expect(myObj).toBe(result);
      expect(myObj.prop).toBe(result.prop);
      expect(myObj.prop.sub).toBe(result.prop.sub);
    });
    it("should shallow copy only objects that were modified", async () => {
      const myObj = {
        prop: {
          sub: {},
        },
        prop2: {
          sub: {},
        },
      };
      const newSub = {};
      const result = produce(myObj, (draft) => {
        draft.prop.sub = {};
        (draft.prop as Obj).sub2 = newSub;
      });
      expect(myObj).not.toBe(result);
      expect(myObj.prop).not.toBe(result.prop);
      expect(myObj.prop.sub).not.toBe(result.prop.sub);
      expect((result.prop as { sub: {}; sub2: {} }).sub2).toBe(newSub);
      expect(result.prop2).toBe(result.prop2);
      expect(result.prop2.sub).toBe(result.prop2.sub);
    });
    it("should create new shallow copies if the object is further modified", async () => {
      const myObj = {
        prop: {
          sub: { counter: 0 },
        },
      };
      const result1 = produce(myObj, (draft) => {
        draft.prop.sub.counter++;
      });
      expect(myObj).not.toBe(result1);
      expect(myObj.prop).not.toBe(result1.prop);
      expect(myObj.prop.sub).not.toBe(result1.prop.sub);
      expect(myObj.prop.sub.counter).not.toBe(result1.prop.sub.counter);
      const result2 = produce(result1, (draft) => {
        draft.prop.sub.counter++;
      });
      expect(result2).not.toBe(result1);
      expect(result2.prop).not.toBe(result1.prop);
      expect(result2.prop.sub).not.toBe(result1.prop.sub);
      expect(result2.prop.sub.counter).not.toBe(result1.prop.sub.counter);
    });
    it("should allow reassign of objects", async () => {
      const myObj = {
        prop: {
          sub: {},
        },
      };
      const result = produce(myObj, (draft) => {
        (draft.prop.sub as Obj).tt = "prova";
        draft.prop.sub = {};
        (draft.prop.sub as Obj).ciao = "prova2";
        draft.prop.sub = [1];
        (draft.prop.sub as Obj)[0] = [1];
        draft.prop.sub = {};
        (draft.prop.sub as Obj).ciao = "prova3";
      });
      expect(result.prop.sub).toEqual({ ciao: "prova3" });
    });
    it("should allow reassign of objects on superior levels", async () => {
      const myObj = {
        prop: {
          sub: {},
        },
      };
      const result = produce(myObj, (draft) => {
        (draft.prop.sub as Obj).tt = "prova";
        (draft as Obj).prop = {};
        (draft.prop as Obj).ciao = "prova2";
        (draft as Obj).prop = [1];
        (draft.prop as Obj)[0] = [1];
        (draft as Obj).prop = {};
        (draft.prop as Obj).ciao = "prova3";
      });
      expect(result.prop).toEqual({ ciao: "prova3" });
    });
    it("should allow multiple references if every of them is called at least once, even read only", async () => {
      const array = [1];
      const state = { test1: array, test2: array };

      // it could be useful a flagged function which checks for all the elements
      const newState2 = produce(state, (draft) => {
        draft.test2;
        draft.test1.push(1);
      });
      expect(newState2.test1).toEqual([1, 1]);
      expect(newState2.test2).toEqual([1, 1]);
    });
    it("works with same child appended in more points", async () => {
      const sub = { test: [1] };
      const myObj = { sub1: sub, sub2: sub };
      const result = produce(myObj, (draft) => {
        draft.sub1.test.push(2);
        draft.sub2.test.push(3); // OR: draft.sub1.test.push(3); draft.sub2 = draft.sub2;
      });
      expect(result.sub1.test).toEqual([1, 2, 3]);
      expect(result.sub2.test).toEqual([1, 2, 3]);
      expect(result.sub1).toBe(result.sub2);
      expect(result.sub1).not.toBe(myObj.sub1);
    });
    it("nested produces should not create problems", async () => {
      const myObj = { test: [1] };
      const result = produce(myObj, (draft) => {
        produce(draft, (d2) => {
          d2.test.push(2);
        });
      });
      expect(result.test).toEqual([1, 2]);
    });
  }
);
