# switch-ts

[![npm version](https://img.shields.io/npm/v/switch-ts.svg)](https://www.npmjs.com/package/switch-ts)
[![CI](https://img.shields.io/github/actions/workflow/status/seijikohara/switch-ts/node.js.yml?branch=main&label=CI)](https://github.com/seijikohara/switch-ts/actions/workflows/node.js.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript library for pattern matching with full type safety and exhaustiveness checking.

This library provides a declarative, fluent interface for implementing pattern matching in TypeScript, offering type-safe value matching, type guards, predicate combinators, and compile-time exhaustiveness checking.

## Installation

```bash
npm install switch-ts
```

## Usage

### Basic Example

```typescript
import { when, eq, then } from 'switch-ts';

const result = when(2)
  .is(eq(1), then('one'))
  .is(eq(2), then('two'))
  .otherwise(then('other'));

console.log(result); // 'two'
```

### Value Matching

```typescript
import { when } from 'switch-ts';

const result = when(2)
  .isValue(1, 'one')
  .isValue(2, 'two')
  .otherwise(() => 'other');

console.log(result); // 'two'
```

### Type-Safe Matching with Type Guards

```typescript
import { when, isString, isNumber } from 'switch-ts';

const value: string | number = 'hello';

const result = when(value)
  .isType(isString, (v) => v.toUpperCase())
  .isType(isNumber, (v) => v.toFixed(2))
  .otherwise(() => 'unknown');

console.log(result); // 'HELLO'
```

### Range Matching

```typescript
import { when, between, betweenExclusive, then } from 'switch-ts';

const score = 85;

const grade = when(score)
  .is(between(90, 100), then('A'))
  .is(between(80, 89), then('B'))
  .is(between(70, 79), then('C'))
  .is(between(60, 69), then('D'))
  .otherwise(then('F'));

console.log(grade); // 'B'
```

### Array Membership Matching

```typescript
import { when, oneOf, noneOf, then } from 'switch-ts';

type Status = 'active' | 'pending' | 'approved' | 'deleted' | 'archived';

const status: Status = 'active';

const result = when(status)
  .is(oneOf(['active', 'pending', 'approved']), then('valid'))
  .is(oneOf(['deleted', 'archived']), then('invalid'))
  .otherwise(then('unknown'));

console.log(result); // 'valid'

// Using noneOf for exclusion
const isActive = when(status)
  .is(noneOf(['deleted', 'archived']), then('active status'))
  .otherwise(then('inactive status'));

console.log(isActive); // 'active status'
```

### Predicate Combinators

```typescript
import { when, all, any, not, gt, lt, eq, then } from 'switch-ts';

const value = 5;

// Logical AND - all predicates must pass
const result1 = when(value)
  .is(all([gt(0), lt(10)]), then('in range'))
  .otherwise(then('out of range'));

console.log(result1); // 'in range'

// Logical OR - any predicate must pass
const result2 = when(value)
  .is(any([eq(2), eq(3), eq(5)]), then('prime'))
  .otherwise(then('not prime'));

console.log(result2); // 'prime'

// Logical NOT - negate a predicate
const result3 = when(value)
  .is(not(eq(0)), then('not zero'))
  .otherwise(then('zero'));

console.log(result3); // 'not zero'
```

### HTTP Status Code Handling

```typescript
import { when, all, ge, lt, then } from 'switch-ts';

const getStatusCategory = (status: number) =>
  when(status)
    .is(all([ge(200), lt(300)]), then('Success'))
    .is(all([ge(300), lt(400)]), then('Redirect'))
    .is(all([ge(400), lt(500)]), then('Client Error'))
    .is(all([ge(500), lt(600)]), then('Server Error'))
    .otherwise(then('Unknown'));

console.log(getStatusCategory(200)); // 'Success'
console.log(getStatusCategory(404)); // 'Client Error'
console.log(getStatusCategory(500)); // 'Server Error'
```

### State Machine

```typescript
import { when } from 'switch-ts';

type State = 'idle' | 'loading' | 'success' | 'error';
type Action = 'start' | 'resolve' | 'reject' | 'reset';

const transition = (state: State, action: Action): State =>
  when(state)
    .isValue(
      'idle',
      when(action).isValue('start', 'loading' as State).otherwise(() => state)
    )
    .isValue(
      'loading',
      when(action)
        .isValue('resolve', 'success' as State)
        .isValue('reject', 'error' as State)
        .otherwise(() => state)
    )
    .isValue(
      'success',
      when(action).isValue('reset', 'idle' as State).otherwise(() => state)
    )
    .isValue(
      'error',
      when(action).isValue('reset', 'idle' as State).otherwise(() => state)
    )
    .otherwise(() => state);

console.log(transition('idle', 'start'));      // 'loading'
console.log(transition('loading', 'resolve')); // 'success'
console.log(transition('success', 'reset'));   // 'idle'
```

### Exhaustiveness Checking

```typescript
import { when, exhaustive } from 'switch-ts';

type Status = 'pending' | 'approved' | 'rejected';

const getMessage = (status: Status): string =>
  when(status)
    .isValue('pending', 'Waiting for approval')
    .isValue('approved', 'Request approved')
    .isValue('rejected', 'Request rejected')
    .otherwise(() => exhaustive(status)); // TypeScript error if any case is missing

console.log(getMessage('pending'));  // 'Waiting for approval'
console.log(getMessage('approved')); // 'Request approved'

// If you add a new status without handling it, TypeScript will show a compile error
```

## API Reference

### Core Functions

#### `when<T>(value: T): When<T>`

Initiates a pattern matching expression with the provided value.

```typescript
when(value)
  .is(predicate, producer)
  .isValue(expectedValue, result)
  .isType(guard, producer)
  .isAny(predicates, producer)
  .isAll(predicates, producer)
  .otherwise(producer);
```

### Matching Methods

#### `.is(predicate, producer)`

Matches when the predicate returns `true`.

```typescript
when(x).is((v) => v > 0, then('positive'))
```

#### `.isValue(expectedValue, result)`

Matches when the value strictly equals the expected value using `===`.

```typescript
when(x).isValue(42, 'the answer')
```

#### `.isType(guard, producer)`

Matches when the type guard returns `true`, providing type narrowing.

```typescript
when(value).isType(isString, (v) => v.toUpperCase())
```

#### `.isAny(predicates, producer)`

Matches when any predicate in the array returns `true` (logical OR).

```typescript
when(x).isAny([eq(1), eq(2), eq(3)], then('one, two, or three'))
```

#### `.isAll(predicates, producer)`

Matches when all predicates in the array return `true` (logical AND).

```typescript
when(x).isAll([gt(0), lt(10)], then('between 0 and 10'))
```

#### `.otherwise(producer)`

Provides a default value when no predicates match. This is required to complete the pattern matching chain.

```typescript
when(x).is(eq(1), then('one')).otherwise(then('other'))
```

### Helper Functions

#### `then<T>(value: T): () => T`

Creates a constant producer function that always returns the given value.

```typescript
when(x).is(eq(1), then('one'))
```

### Comparison Predicates

#### `eq<T>(expected: T): (actual: T) => boolean`

Creates an equality comparison predicate (`===`).

```typescript
when(x).is(eq(42), then('matched'))
```

#### `ne<T>(expected: T): (actual: T) => boolean`

Creates an inequality comparison predicate (`!==`).

```typescript
when(x).is(ne(0), then('not zero'))
```

#### `gt<T>(threshold: T): (value: T) => boolean`

Creates a greater-than comparison predicate (`>`).

```typescript
when(x).is(gt(0), then('positive'))
```

#### `lt<T>(threshold: T): (value: T) => boolean`

Creates a less-than comparison predicate (`<`).

```typescript
when(x).is(lt(0), then('negative'))
```

#### `ge<T>(threshold: T): (value: T) => boolean`

Creates a greater-than-or-equal comparison predicate (`>=`).

```typescript
when(x).is(ge(0), then('non-negative'))
```

#### `le<T>(threshold: T): (value: T) => boolean`

Creates a less-than-or-equal comparison predicate (`<=`).

```typescript
when(x).is(le(10), then('at most ten'))
```

### Range Predicates

#### `between<T>(min: T, max: T): (value: T) => boolean`

Creates a predicate that checks if a value is within a range (inclusive).

```typescript
when(score).is(between(0, 100), then('valid score'))
```

#### `betweenExclusive<T>(min: T, max: T): (value: T) => boolean`

Creates a predicate that checks if a value is within a range (exclusive).

```typescript
when(age).is(betweenExclusive(18, 65), then('working age'))
```

### Array Predicates

#### `oneOf<T>(values: readonly T[]): (value: T) => boolean`

Creates a predicate that checks if a value is included in an array.

```typescript
when(status).is(oneOf(['active', 'pending', 'approved']), then('valid status'))
```

#### `noneOf<T>(values: readonly T[]): (value: T) => boolean`

Creates a predicate that checks if a value is not included in an array.

```typescript
when(status).is(noneOf(['deleted', 'archived']), then('active status'))
```

### Type Guard Predicates

#### `isString(value: unknown): value is string`

Type guard for string values.

```typescript
when(value).isType(isString, (v) => v.toUpperCase())
```

#### `isNumber(value: unknown): value is number`

Type guard for number values.

```typescript
when(value).isType(isNumber, (v) => v.toFixed(2))
```

#### `isBoolean(value: unknown): value is boolean`

Type guard for boolean values.

```typescript
when(value).isType(isBoolean, (v) => v ? 'yes' : 'no')
```

#### `isNull(value: unknown): value is null`

Type guard for null values.

```typescript
when(value).isType(isNull, () => 'is null')
```

#### `isUndefined(value: unknown): value is undefined`

Type guard for undefined values.

```typescript
when(value).isType(isUndefined, () => 'is undefined')
```

### Logical Combinators

#### `all<T>(predicates: readonly ((value: T) => boolean)[]): (value: T) => boolean`

Combines multiple predicates with logical AND. All predicates must return `true`.

```typescript
when(x).is(all([gt(0), lt(10)]), then('between 0 and 10'))
```

#### `any<T>(predicates: readonly ((value: T) => boolean)[]): (value: T) => boolean`

Combines multiple predicates with logical OR. At least one predicate must return `true`.

```typescript
when(x).is(any([eq(1), eq(2), eq(3)]), then('one, two, or three'))
```

#### `not<T>(predicate: (value: T) => boolean): (value: T) => boolean`

Negates a predicate, returning the opposite boolean value.

```typescript
when(x).is(not(eq(0)), then('not zero'))
```

### Exhaustiveness Checking

#### `exhaustive(value: never): never`

Ensures exhaustive checking of all cases in pattern matching. This function should never be reached if all cases are handled. Throws an error if called, indicating a missing case in the pattern match.

```typescript
type Status = 'pending' | 'approved' | 'rejected';

const getMessage = (status: Status): string =>
  when(status)
    .isValue('pending', 'Waiting')
    .isValue('approved', 'Approved')
    .isValue('rejected', 'Rejected')
    .otherwise(() => exhaustive(status)); // TypeScript error if any case is missing
```

## Important Notes

### Type Safety

This library provides full TypeScript type safety with:
- Type narrowing through type guards
- Exhaustiveness checking for union types
- Compile-time validation of pattern completeness

### Performance Considerations

Pattern matching evaluation is short-circuit: once a predicate matches, subsequent predicates are not evaluated. Order your predicates from most specific to most general for optimal performance.

### Comparison with Native Switch

Unlike native JavaScript `switch` statements, `switch-ts` provides:
- Type-safe pattern matching with type narrowing
- First-class support for complex predicates
- Exhaustiveness checking at compile time
- Functional composition through predicate combinators
- Immutable, expression-based syntax

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
