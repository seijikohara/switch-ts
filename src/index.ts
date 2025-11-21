// ============================================================================
// Types
// ============================================================================

/**
 * Type guard function that narrows the type of a value.
 * @template T - The input type
 * @template U - The narrowed type
 */
type TypeGuard<T, U extends T> = (value: T) => value is U;

/**
 * Type representing the initial state of a pattern matching expression.
 * @template T - The type of the value being matched
 */
type When<T> = {
  is: <R>(predicate: (value: T) => boolean, producer: () => R) => Chain<T, R>;
  isValue: <V extends T, R>(expectedValue: V, result: R) => Chain<T, R>;
  isType: <U extends T, R>(guard: TypeGuard<T, U>, producer: (value: U) => R) => Chain<T, R>;
  isAny: <R>(predicates: readonly ((value: T) => boolean)[], producer: () => R) => Chain<T, R>;
  isAll: <R>(predicates: readonly ((value: T) => boolean)[], producer: () => R) => Chain<T, R>;
};

/**
 * Type representing a chain of pattern matching conditions.
 * @template T - The type of the value being matched
 * @template R - The type of the result value
 */
type Chain<T, R> = {
  is: (predicate: (value: T) => boolean, producer: () => R) => Chain<T, R>;
  isValue: <V extends T>(expectedValue: V, result: R) => Chain<T, R>;
  isType: <U extends T>(guard: TypeGuard<T, U>, producer: (value: U) => R) => Chain<T, R>;
  isAny: (predicates: readonly ((value: T) => boolean)[], producer: () => R) => Chain<T, R>;
  isAll: (predicates: readonly ((value: T) => boolean)[], producer: () => R) => Chain<T, R>;
  otherwise: (producer: () => R) => R;
};

// ============================================================================
// Internal Functions
// ============================================================================

/**
 * Internal function to create a matched chain that always returns the same value.
 * @internal
 */
const match = <T, R>(value: R): Chain<T, R> => ({
  is: () => match<T, R>(value),
  isValue: () => match<T, R>(value),
  isType: () => match<T, R>(value),
  isAny: () => match<T, R>(value),
  isAll: () => match<T, R>(value),
  otherwise: () => value,
});

/**
 * Internal function to create an unmatched chain that continues pattern matching.
 * @internal
 */
const chain = <T, R>(value: T): Chain<T, R> => ({
  is: (predicate, producer) => (predicate(value) ? match(producer()) : chain<T, R>(value)),

  isValue: <V extends T>(expectedValue: V, result: R) =>
    value === expectedValue ? match<T, R>(result) : chain<T, R>(value),

  isType: <U extends T>(guard: TypeGuard<T, U>, producer: (v: U) => R) =>
    guard(value) ? match<T, R>(producer(value)) : chain<T, R>(value),

  isAny: (predicates, producer) => (predicates.some((pred) => pred(value)) ? match(producer()) : chain<T, R>(value)),

  isAll: (predicates, producer) =>
    predicates.every((pred) => pred(value)) ? match(producer()) : chain<T, R>(value),

  otherwise: (producer) => producer(),
});

// ============================================================================
// Core Pattern Matching API
// ============================================================================

/**
 * Starts a pattern matching expression.
 *
 * @template T - The type of the value to match
 * @param value - The value to match against
 * @returns A pattern matching builder
 *
 * @example
 * ```typescript
 * const result = when(2)
 *   .is(v => v === 1, () => 'one')
 *   .is(v => v === 2, () => 'two')
 *   .otherwise(() => 'other');
 * // result is 'two'
 * ```
 *
 * @example
 * ```typescript
 * // Using isValue for direct value matching
 * const result = when(2)
 *   .isValue(1, 'one')
 *   .isValue(2, 'two')
 *   .otherwise(() => 'other');
 * // result is 'two'
 * ```
 *
 * @example
 * ```typescript
 * // Using isType for type-safe matching
 * const result = when<string | number>(value)
 *   .isType((v): v is string => typeof v === 'string', v => v.toUpperCase())
 *   .isType((v): v is number => typeof v === 'number', v => v.toFixed(2))
 *   .otherwise(() => 'unknown');
 * ```
 */
export const when = <T>(value: T): When<T> => ({
  is: <R>(predicate: (v: T) => boolean, producer: () => R) =>
    predicate(value) ? match<T, R>(producer()) : chain<T, R>(value),

  isValue: <V extends T, R>(expectedValue: V, result: R) =>
    value === expectedValue ? match<T, R>(result) : chain<T, R>(value),

  isType: <U extends T, R>(guard: TypeGuard<T, U>, producer: (v: U) => R) =>
    guard(value) ? match<T, R>(producer(value)) : chain<T, R>(value),

  isAny: <R>(predicates: readonly ((v: T) => boolean)[], producer: () => R) =>
    predicates.some((pred) => pred(value)) ? match(producer()) : chain<T, R>(value),

  isAll: <R>(predicates: readonly ((v: T) => boolean)[], producer: () => R) =>
    predicates.every((pred) => pred(value)) ? match(producer()) : chain<T, R>(value),
});

// ============================================================================
// Producer Helpers
// ============================================================================

/**
 * Creates a constant producer function that always returns the given value.
 * Useful for creating producer functions in pattern matching.
 *
 * @template T - The type of the value
 * @param value - The value to return
 * @returns A function that returns the value
 *
 * @example
 * ```typescript
 * when(x).is(eq(1), then('one'))
 * ```
 */
export const then =
  <T>(value: T) =>
  () =>
    value;

// ============================================================================
// Comparison Predicates
// ============================================================================

/**
 * Creates a curried equality comparison function.
 * Returns a function that checks if the given value equals the expected value.
 *
 * @template T - The type of values to compare
 * @param expected - The expected value to compare against
 * @returns A function that takes a value and returns true if equal
 *
 * @example
 * ```typescript
 * when(x).is(eq(1), then('one'))
 * // Checks if x === 1
 * ```
 */
export const eq =
  <T>(expected: T) =>
  (actual: T) =>
    expected === actual;

/**
 * Creates a curried inequality comparison function.
 * Returns a function that checks if the given value is not equal to the expected value.
 *
 * @template T - The type of values to compare
 * @param expected - The expected value to compare against
 * @returns A function that takes a value and returns true if not equal
 *
 * @example
 * ```typescript
 * when(x).is(ne(1), then('not one'))
 * // Checks if x !== 1
 * ```
 */
export const ne =
  <T>(expected: T) =>
  (actual: T) =>
    expected !== actual;

/**
 * Creates a curried greater-than comparison function.
 * Returns a function that checks if the given value is greater than the threshold.
 *
 * Note: The threshold and value should be comparable types (number, string, bigint, or Date).
 *
 * @template T - The type of values to compare
 * @param threshold - The threshold value to compare against
 * @returns A function that takes a value and returns true if greater than threshold
 *
 * @example
 * ```typescript
 * when(x).is(gt(0), then('positive'))
 * // Checks if x > 0
 * ```
 */
export const gt =
  <T>(threshold: T) =>
  (value: T) =>
    value > threshold;

/**
 * Creates a curried less-than comparison function.
 * Returns a function that checks if the given value is less than the threshold.
 *
 * Note: The threshold and value should be comparable types (number, string, bigint, or Date).
 *
 * @template T - The type of values to compare
 * @param threshold - The threshold value to compare against
 * @returns A function that takes a value and returns true if less than threshold
 *
 * @example
 * ```typescript
 * when(x).is(lt(0), then('negative'))
 * // Checks if x < 0
 * ```
 */
export const lt =
  <T>(threshold: T) =>
  (value: T) =>
    value < threshold;

/**
 * Creates a curried greater-than-or-equal comparison function.
 * Returns a function that checks if the given value is greater than or equal to the threshold.
 *
 * Note: The threshold and value should be comparable types (number, string, bigint, or Date).
 *
 * @template T - The type of values to compare
 * @param threshold - The threshold value to compare against
 * @returns A function that takes a value and returns true if greater than or equal to threshold
 *
 * @example
 * ```typescript
 * when(x).is(ge(0), then('non-negative'))
 * // Checks if x >= 0
 * ```
 */
export const ge =
  <T>(threshold: T) =>
  (value: T) =>
    value >= threshold;

/**
 * Creates a curried less-than-or-equal comparison function.
 * Returns a function that checks if the given value is less than or equal to the threshold.
 *
 * Note: The threshold and value should be comparable types (number, string, bigint, or Date).
 *
 * @template T - The type of values to compare
 * @param threshold - The threshold value to compare against
 * @returns A function that takes a value and returns true if less than or equal to threshold
 *
 * @example
 * ```typescript
 * when(x).is(le(10), then('at most ten'))
 * // Checks if x <= 10
 * ```
 */
export const le =
  <T>(threshold: T) =>
  (value: T) =>
    value <= threshold;

// ============================================================================
// Range Predicates
// ============================================================================

/**
 * Creates a predicate that checks if a value is within a range (inclusive).
 * Returns true if min <= value <= max.
 *
 * Note: The min, max, and value should be comparable types (number, string, bigint, or Date).
 *
 * @template T - The type of values to compare
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A function that takes a value and returns true if within range
 *
 * @example
 * ```typescript
 * when(score)
 *   .is(between(0, 100), then('valid score'))
 *   .otherwise(then('invalid score'))
 * // Checks if 0 <= score <= 100
 * ```
 */
export const between =
  <T>(min: T, max: T) =>
  (value: T) =>
    value >= min && value <= max;

/**
 * Creates a predicate that checks if a value is within a range (exclusive).
 * Returns true if min < value < max.
 *
 * Note: The min, max, and value should be comparable types (number, string, bigint, or Date).
 *
 * @template T - The type of values to compare
 * @param min - The minimum value (exclusive)
 * @param max - The maximum value (exclusive)
 * @returns A function that takes a value and returns true if within range
 *
 * @example
 * ```typescript
 * when(age)
 *   .is(betweenExclusive(18, 65), then('working age'))
 *   .otherwise(then('not working age'))
 * // Checks if 18 < age < 65
 * ```
 */
export const betweenExclusive =
  <T>(min: T, max: T) =>
  (value: T) =>
    value > min && value < max;

// ============================================================================
// Array Predicates
// ============================================================================

/**
 * Creates a predicate that checks if a value is included in an array.
 *
 * @template T - The type of values to compare
 * @param values - Array of values to check against
 * @returns A function that takes a value and returns true if included in the array
 *
 * @example
 * ```typescript
 * when(status)
 *   .is(oneOf(['active', 'pending', 'approved']), then('valid status'))
 *   .otherwise(then('invalid status'))
 * // Checks if status is 'active', 'pending', or 'approved'
 * ```
 */
export const oneOf =
  <T>(values: readonly T[]) =>
  (value: T) =>
    values.includes(value);

/**
 * Creates a predicate that checks if a value is not included in an array.
 *
 * @template T - The type of values to compare
 * @param values - Array of values to check against
 * @returns A function that takes a value and returns true if not included in the array
 *
 * @example
 * ```typescript
 * when(status)
 *   .is(noneOf(['deleted', 'archived']), then('active status'))
 *   .otherwise(then('inactive status'))
 * // Checks if status is neither 'deleted' nor 'archived'
 * ```
 */
export const noneOf =
  <T>(values: readonly T[]) =>
  (value: T) =>
    !values.includes(value);

// ============================================================================
// Type Guard Predicates
// ============================================================================

/**
 * Creates a type guard for string values.
 *
 * @example
 * ```typescript
 * when(value)
 *   .isType(isString, v => v.toUpperCase())
 *   .otherwise(() => 'not a string')
 * ```
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Creates a type guard for number values.
 *
 * @example
 * ```typescript
 * when(value)
 *   .isType(isNumber, v => v.toFixed(2))
 *   .otherwise(() => 'not a number')
 * ```
 */
export const isNumber = (value: unknown): value is number => typeof value === 'number';

/**
 * Creates a type guard for boolean values.
 *
 * @example
 * ```typescript
 * when(value)
 *   .isType(isBoolean, v => v ? 'yes' : 'no')
 *   .otherwise(() => 'not a boolean')
 * ```
 */
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

/**
 * Creates a type guard for null values.
 *
 * @example
 * ```typescript
 * when(value)
 *   .isType(isNull, () => 'is null')
 *   .otherwise(() => 'not null')
 * ```
 */
export const isNull = (value: unknown): value is null => value === null;

/**
 * Creates a type guard for undefined values.
 *
 * @example
 * ```typescript
 * when(value)
 *   .isType(isUndefined, () => 'is undefined')
 *   .otherwise(() => 'not undefined')
 * ```
 */
export const isUndefined = (value: unknown): value is undefined => value === undefined;

// ============================================================================
// Logical Combinators
// ============================================================================

/**
 * Creates a combinator that combines multiple predicates with logical AND.
 * All predicates must return true for the combinator to return true.
 *
 * @template T - The type of value to test
 * @param predicates - Array of predicate functions
 * @returns A function that returns true if all predicates return true
 *
 * @example
 * ```typescript
 * when(x)
 *   .is(all([gt(0), lt(10)]), then('between 0 and 10'))
 *   .otherwise(then('outside range'))
 * ```
 */
export const all =
  <T>(predicates: readonly ((value: T) => boolean)[]) =>
  (value: T) =>
    predicates.every((pred) => pred(value));

/**
 * Creates a combinator that combines multiple predicates with logical OR.
 * At least one predicate must return true for the combinator to return true.
 *
 * @template T - The type of value to test
 * @param predicates - Array of predicate functions
 * @returns A function that returns true if any predicate returns true
 *
 * @example
 * ```typescript
 * when(x)
 *   .is(any([eq(1), eq(2), eq(3)]), then('one, two, or three'))
 *   .otherwise(then('other'))
 * ```
 */
export const any =
  <T>(predicates: readonly ((value: T) => boolean)[]) =>
  (value: T) =>
    predicates.some((pred) => pred(value));

/**
 * Creates a predicate that negates another predicate.
 *
 * @template T - The type of value to test
 * @param predicate - The predicate to negate
 * @returns A function that returns the opposite of the predicate
 *
 * @example
 * ```typescript
 * when(x)
 *   .is(not(eq(0)), then('not zero'))
 *   .otherwise(then('zero'))
 * ```
 */
export const not =
  <T>(predicate: (value: T) => boolean) =>
  (value: T) =>
    !predicate(value);

// ============================================================================
// Exhaustiveness Checking
// ============================================================================

/**
 * Ensures exhaustive checking of all cases in pattern matching.
 * This function should never be reached if all cases are handled.
 * Throws an error if called, indicating a missing case in the pattern match.
 *
 * This is useful for ensuring all members of a union type are handled.
 *
 * @param value - The value that should be of type never (all cases handled)
 * @throws {Error} Always throws an error indicating an unhandled case
 *
 * @example
 * ```typescript
 * type Status = 'pending' | 'approved' | 'rejected';
 *
 * const getMessage = (status: Status): string =>
 *   when(status)
 *     .isValue('pending', 'Waiting for approval')
 *     .isValue('approved', 'Request approved')
 *     .isValue('rejected', 'Request rejected')
 *     .otherwise(() => exhaustive(status)); // TypeScript error if any case is missing
 * ```
 */
export const exhaustive = (value: never): never => {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
};
