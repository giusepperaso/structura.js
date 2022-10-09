import { describe, expect, it } from "vitest";
import { Patch, produce } from "..";

describe.concurrent("test patch production", () => {
  it("is the right number of patches", async () => {
    const myObj: number[][] = [[], [], [], []];
    //const myObj: { [k: string]: number }[] = [{ A: 1 }];
    let patches: Patch[];
    const result = produce(
      myObj,
      (draft) => {
        /* draft[0].B = 2;
        draft[0].C = 3;
        draft[0].D = 4;
        draft[0].E = 5; */
        draft[0].push(0);
        draft[0].push(1);
        draft[0].push(2);
        /* draft[0][0] = 0;
        draft[0][1] = 1;
        draft[0][2] = 2; */
      },
      (_patches) => {
        patches = _patches;
        console.log(JSON.stringify(patches));
      }
    );
    expect(result[0]).not.toBe(myObj[0]);
    //expect(myObj[0].length).toBe(0);
    //expect(patches![0]).toBe(patches![1]);
  });
});
