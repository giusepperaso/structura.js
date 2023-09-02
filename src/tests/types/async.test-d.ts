import { test, expectTypeOf, describe } from "vitest";
import { Patch, asyncProduce, asyncProduceWithPatches, produce } from "../../";

describe("async producers should work", () => {
  test("async producers work if the producer is async", () => {
    const obj = { n: 1 };
    const promise = asyncProduce(obj, async (draft) => {
      draft.n++;
    });
    promise.then((result) => expectTypeOf(result).toMatchTypeOf(obj));
    expectTypeOf(promise).toMatchTypeOf(Promise.resolve(obj));
  });
  test("async produce with patches works", () => {
    const obj = { n: 1 };
    const promise = asyncProduceWithPatches(obj, async (draft) => {
      draft.n++;
    });
    const mockReturn = [obj, [] as Patch[], [] as Patch[]] as const;
    promise.then((result) => expectTypeOf(result).toMatchTypeOf(mockReturn));
    expectTypeOf(promise).toMatchTypeOf(Promise.resolve(mockReturn));
  });
  test("async producers don't work if the producer is sync", () => {
    const obj = { n: 1 };
    //@ts-expect-error can't work because producer is async
    const result = asyncProduce(obj, (draft) => {
      draft.n++;
    });
  });
  test("sync producers don't work if the producer is async", () => {
    const obj = { n: 1 };
    const promise = produce(obj, async (draft) => {
      draft.n++;
    });
    //@ts-expect-error can't work because the resulting type is never
    promise.then(data=>data)
    //@ts-expect-error can't work because the resulting type is never
    expectTypeOf(promise).toMatchTypeOf(Promise.resolve(obj));
  });
});
