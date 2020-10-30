import { eq, ne, ge, gt, lt, le, when } from "./index";

test("match 1", () => {
  const actual: string = when(1)
    .on(v => v === 1, () => "A")
    .on(v => v === 2, () => "B")
    .otherwise(() => "C");

  expect(actual).toBe("A");
});

test("match 2", () => {
  const actual: string = when(2)
  .on(v => v === 1, () => "A")
  .on(v => v === 2, () => "B")
  .otherwise(() => "C");

  expect(actual).toBe("B");
});

test("match otherwise", () => {
  const actual: string = when(3)
  .on(v => v === 1, () => "A")
  .on(v => v === 2, () => "B")
  .otherwise(() => "C");

  expect(actual).toBe("C");
});

test("operator", () =>{
  expect(eq(0)(1)).toBe(false)
  expect(eq(1)(1)).toBe(true)

  expect(ne(0)(1)).toBe(true)
  expect(ne(1)(1)).toBe(false)

  expect(gt(0)(1)).toBe(false)
  expect(gt(1)(1)).toBe(false)
  expect(gt(2)(1)).toBe(true)

  expect(lt(0)(1)).toBe(true)
  expect(lt(1)(1)).toBe(false)
  expect(lt(2)(1)).toBe(false)

  expect(ge(0)(1)).toBe(false)
  expect(ge(1)(1)).toBe(true)
  expect(ge(2)(1)).toBe(true)

  expect(le(0)(1)).toBe(true)
  expect(le(1)(1)).toBe(true)
  expect(le(2)(1)).toBe(false)
})
