import { eq, ne, ge, gt, lt, le, then, when } from "./index";

test("match 1", () => {
  const actual: string = when(1)
    .is(
      (v) => v === 1,
      () => "A"
    )
    .is(
      (v) => v === 2,
      () => "B"
    )
    .default(() => "C");

  expect(actual).toBe("A");
});

test("match 2", () => {
  const actual: string = when(2)
    .is(
      (v) => v === 1,
      () => "A"
    )
    .is(
      (v) => v === 2,
      () => "B"
    )
    .default(() => "C");

  expect(actual).toBe("B");
});

test("match default", () => {
  const actual: string = when(3)
    .is(
      (v) => v === 1,
      () => "A"
    )
    .is(
      (v) => v === 2,
      () => "B"
    )
    .default(() => "C");

  expect(actual).toBe("C");
});

test("use helper", () => {
  const actual: string = when(-1)
    .is(le(1), then("A"))
    .is(gt(2), then("B"))
    .default(then("C"));

  expect(actual).toBe("A");
});

test("helper", () => {
  expect(eq(0)(1)).toBe(false);
  expect(eq(1)(1)).toBe(true);

  expect(ne(0)(1)).toBe(true);
  expect(ne(1)(1)).toBe(false);

  expect(gt(0)(1)).toBe(true);
  expect(gt(1)(1)).toBe(false);
  expect(gt(2)(1)).toBe(false);

  expect(lt(0)(1)).toBe(false);
  expect(lt(1)(1)).toBe(false);
  expect(lt(2)(1)).toBe(true);

  expect(ge(0)(1)).toBe(true);
  expect(ge(1)(1)).toBe(true);
  expect(ge(2)(1)).toBe(false);

  expect(le(0)(1)).toBe(false);
  expect(le(1)(1)).toBe(true);
  expect(le(2)(1)).toBe(true);
});
