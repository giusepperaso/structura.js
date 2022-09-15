  it("array push to work well", () => {
    const myObj = { test1: [1] };
    const result = produce(myObj, (draft) => {
      draft.test1.push(1);
    });
    expect(result.test1).not.toBe(myObj.test1);
  });
