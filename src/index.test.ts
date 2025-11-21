import {
  all,
  any,
  between,
  betweenExclusive,
  eq,
  exhaustive,
  ge,
  gt,
  isBoolean,
  isNull,
  isNumber,
  isString,
  isUndefined,
  le,
  lt,
  ne,
  noneOf,
  not,
  oneOf,
  then,
  when,
} from './index';

/**
 * Test suite for switch-ts pattern matching library
 * Following Jest 30 best practices:
 * - Descriptive test names
 * - AAA (Arrange-Act-Assert) pattern
 * - Explicit assertion counts for complex tests
 * - Type safety with TypeScript
 */
describe('when() - Pattern matching', () => {
  describe('Basic pattern matching with .is()', () => {
    it('should match first predicate', () => {
      const result = when(1)
        .is(
          (v) => v === 1,
          () => 'one',
        )
        .is(
          (v) => v === 2,
          () => 'two',
        )
        .otherwise(() => 'other');

      expect(result).toBe('one');
    });

    it('should match second predicate when first fails', () => {
      const result = when(2)
        .is(
          (v) => v === 1,
          () => 'one',
        )
        .is(
          (v) => v === 2,
          () => 'two',
        )
        .otherwise(() => 'other');

      expect(result).toBe('two');
    });

    it('should return default when no predicates match', () => {
      const result = when(3)
        .is(
          (v) => v === 1,
          () => 'one',
        )
        .is(
          (v) => v === 2,
          () => 'two',
        )
        .otherwise(() => 'other');

      expect(result).toBe('other');
    });

    it('should stop evaluation after first match', () => {
      const mockProducer = jest.fn(() => 'matched');
      const mockSecondProducer = jest.fn(() => 'second');

      const result = when(1)
        .is(
          (v) => v === 1,
          () => mockProducer(),
        )
        .is(
          (v) => v === 1,
          () => mockSecondProducer(),
        )
        .otherwise(() => 'default');

      expect(result).toBe('matched');
      expect(mockProducer).toHaveBeenCalledTimes(1);
      expect(mockSecondProducer).not.toHaveBeenCalled();
    });
  });

  describe('Value matching with .isValue()', () => {
    it('should match exact value', () => {
      const result = when(2).isValue(1, 'one').isValue(2, 'two').otherwise(() => 'other');

      expect(result).toBe('two');
    });

    it('should work with string values', () => {
      const result = when('hello')
        .isValue('world', 'World!')
        .isValue('hello', 'Hello!')
        .otherwise(() => 'Unknown');

      expect(result).toBe('Hello!');
    });

    it('should use strict equality (===)', () => {
      const result = when<string | number>('2')
        .isValue(2, 'number')
        .otherwise(() => 'not matched');

      expect(result).toBe('not matched');
    });

    it('should match boolean values correctly', () => {
      const result = when(true).isValue(false, 'no').isValue(true, 'yes').otherwise(() => 'unknown');

      expect(result).toBe('yes');
    });

    it('should match null values', () => {
      const result = when<string | null>(null)
        .isValue('test', 'string')
        .isValue(null, 'null value')
        .otherwise(() => 'other');

      expect(result).toBe('null value');
    });
  });

  describe('Type-safe matching with .isType()', () => {
    it('should match string type and provide narrowed type to producer', () => {
      const value: string | number = 'hello';

      const result = when(value)
        .isType(
          (v: string | number): v is string => typeof v === 'string',
          (v) => `String: ${v.toUpperCase()}`,
        )
        .otherwise(() => 'not a string');

      expect(result).toBe('String: HELLO');
    });

    it('should match number type and provide narrowed type to producer', () => {
      const value: string | number = 42;

      const result = when(value)
        .isType(
          (v: string | number): v is number => typeof v === 'number',
          (v) => `Number: ${v.toFixed(2)}`,
        )
        .otherwise(() => 'not a number');

      expect(result).toBe('Number: 42.00');
    });

    it('should handle complex union types', () => {
      type Response = { status: 'success'; data: string } | { status: 'error'; message: string };

      const successResponse: Response = { status: 'success', data: 'result' };
      const result = when(successResponse)
        .isType(
          (v: Response): v is { status: 'success'; data: string } => v.status === 'success',
          (v) => `Success: ${v.data}`,
        )
        .otherwise(() => 'Unknown response');

      expect(result).toBe('Success: result');
    });

    it('should handle error responses in union types', () => {
      type Response = { status: 'success'; data: string } | { status: 'error'; message: string };

      const errorResponse: Response = { status: 'error', message: 'Something went wrong' };
      const result = when(errorResponse)
        .isType(
          (v: Response): v is { status: 'error'; message: string } => v.status === 'error',
          (v) => `Error: ${v.message}`,
        )
        .otherwise(() => 'Unknown response');

      expect(result).toBe('Error: Something went wrong');
    });
  });

  describe('Multiple predicate matching with .isAny()', () => {
    it('should match when any predicate returns true', () => {
      const result = when(5)
        .isAny(
          [(v) => v === 3, (v) => v === 5, (v) => v === 7],
          () => 'odd prime',
        )
        .otherwise(() => 'other');

      expect(result).toBe('odd prime');
    });

    it('should not match when all predicates return false', () => {
      const result = when(4)
        .isAny(
          [(v) => v === 3, (v) => v === 5, (v) => v === 7],
          () => 'odd prime',
        )
        .otherwise(() => 'other');

      expect(result).toBe('other');
    });

    it('should match on first true predicate', () => {
      const result = when(3)
        .isAny(
          [(v) => v === 3, (v) => v === 5, (v) => v === 7],
          () => 'matched',
        )
        .otherwise(() => 'not matched');

      expect(result).toBe('matched');
    });
  });

  describe('Multiple predicate matching with .isAll()', () => {
    it('should match when all predicates return true', () => {
      const result = when(6)
        .isAll(
          [(v) => v > 0, (v) => v < 10, (v) => v % 2 === 0],
          () => 'positive even single-digit',
        )
        .otherwise(() => 'other');

      expect(result).toBe('positive even single-digit');
    });

    it('should not match when any predicate returns false', () => {
      const result = when(5)
        .isAll(
          [(v) => v > 0, (v) => v < 10, (v) => v % 2 === 0],
          () => 'positive even single-digit',
        )
        .otherwise(() => 'other');

      expect(result).toBe('other');
    });

    it('should handle empty predicate array', () => {
      const result = when(42)
        .isAll([], () => 'matched')
        .otherwise(() => 'not matched');

      expect(result).toBe('matched');
    });
  });

  describe('Chaining different matching methods', () => {
    it('should support mixed matching strategies', () => {
      const result = when<number>(5)
        .isValue(1, 'one')
        .is(
          (v) => v === 2,
          () => 'two',
        )
        .isAll(
          [(v) => v > 3, (v) => v < 6],
          () => 'between 3 and 6',
        )
        .otherwise(() => 'other');

      expect(result).toBe('between 3 and 6');
    });

    it('should respect matching order', () => {
      const result = when(5)
        .isValue(5, 'exact match')
        .is(
          (v) => v === 5,
          () => 'predicate match',
        )
        .otherwise(() => 'default');

      expect(result).toBe('exact match');
    });
  });
});

describe('Helper functions', () => {
  describe('then() - Producer helper', () => {
    it('should create a producer function that returns the given value', () => {
      const producer = then('hello');
      expect(producer()).toBe('hello');
    });

    it('should work with when() pattern matching', () => {
      const result = when(1).is(eq(1), then('one')).otherwise(then('other'));

      expect(result).toBe('one');
    });

    it.each([
      [42, 42],
      ['test', 'test'],
      [true, true],
    ])('should handle %p values', (input, expected) => {
      expect(then(input)()).toBe(expected);
    });

    it('should handle null values', () => {
      expect(then(null)()).toBeNull();
    });
  });

  describe('eq() - Equality comparison', () => {
    it('should create equality predicate', () => {
      const isOne = eq(1);
      expect(isOne(1)).toBe(true);
      expect(isOne(2)).toBe(false);
    });

    it('should use strict equality', () => {
      const isTwo = eq<string | number>(2);
      expect(isTwo('2')).toBe(false);
    });

    it('should work with when()', () => {
      const result = when(42).is(eq(42), then('matched')).otherwise(then('not matched'));

      expect(result).toBe('matched');
    });
  });

  describe('ne() - Inequality comparison', () => {
    it('should create inequality predicate', () => {
      const notOne = ne(1);
      expect(notOne(1)).toBe(false);
      expect(notOne(2)).toBe(true);
    });

    it('should work with when()', () => {
      const result = when(42).is(ne(0), then('not zero')).otherwise(then('zero'));

      expect(result).toBe('not zero');
    });
  });

  describe('gt() - Greater than comparison', () => {
    it('should compare numbers correctly', () => {
      const greaterThan10 = gt(10);
      expect(greaterThan10(15)).toBe(true);
      expect(greaterThan10(10)).toBe(false);
      expect(greaterThan10(5)).toBe(false);
    });

    it('should work with when()', () => {
      const result = when(15).is(gt(10), then('greater')).otherwise(then('not greater'));

      expect(result).toBe('greater');
    });
  });

  describe('lt() - Less than comparison', () => {
    it('should compare numbers correctly', () => {
      const lessThan10 = lt(10);
      expect(lessThan10(5)).toBe(true);
      expect(lessThan10(10)).toBe(false);
      expect(lessThan10(15)).toBe(false);
    });

    it('should work with when()', () => {
      const result = when(5).is(lt(10), then('less')).otherwise(then('not less'));

      expect(result).toBe('less');
    });
  });

  describe('ge() - Greater than or equal comparison', () => {
    it('should compare numbers correctly', () => {
      const greaterOrEqual10 = ge(10);
      expect(greaterOrEqual10(15)).toBe(true);
      expect(greaterOrEqual10(10)).toBe(true);
      expect(greaterOrEqual10(5)).toBe(false);
    });

    it('should work with when()', () => {
      const result = when(10).is(ge(10), then('greater or equal')).otherwise(then('less'));

      expect(result).toBe('greater or equal');
    });
  });

  describe('le() - Less than or equal comparison', () => {
    it('should compare numbers correctly', () => {
      const lessOrEqual10 = le(10);
      expect(lessOrEqual10(5)).toBe(true);
      expect(lessOrEqual10(10)).toBe(true);
      expect(lessOrEqual10(15)).toBe(false);
    });

    it('should work with when()', () => {
      const result = when(10).is(le(10), then('less or equal')).otherwise(then('greater'));

      expect(result).toBe('less or equal');
    });
  });
});

describe('Type guards', () => {
  describe('isString()', () => {
    it('should identify string values', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });

    it('should work with when().isType()', () => {
      const value: unknown = 'hello';
      const result = when(value)
        .isType(isString, (v) => v.toUpperCase())
        .otherwise(() => 'not a string');

      expect(result).toBe('HELLO');
    });
  });

  describe('isNumber()', () => {
    it('should identify number values', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber('123')).toBe(false);
      expect(isNumber(null)).toBe(false);
    });

    it('should work with when().isType()', () => {
      const value: unknown = 42.5;
      const result = when(value)
        .isType(isNumber, (v) => v.toFixed(2))
        .otherwise(() => 'not a number');

      expect(result).toBe('42.50');
    });
  });

  describe('isBoolean()', () => {
    it('should identify boolean values', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });

    it('should work with when().isType()', () => {
      const value: unknown = true;
      const result = when(value)
        .isType(isBoolean, (v) => `Boolean: ${v ? 'yes' : 'no'}`)
        .otherwise(() => 'not a boolean');

      expect(result).toBe('Boolean: yes');
    });
  });

  describe('isNull()', () => {
    it('should identify null values', () => {
      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull('')).toBe(false);
      expect(isNull(false)).toBe(false);
    });

    it('should work with when().isType()', () => {
      const value: unknown = null;
      const result = when(value)
        .isType(isNull, () => 'is null')
        .otherwise(() => 'not null');

      expect(result).toBe('is null');
    });
  });

  describe('isUndefined()', () => {
    it('should identify undefined values', () => {
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
      expect(isUndefined('')).toBe(false);
      expect(isUndefined(false)).toBe(false);
    });

    it('should work with when().isType()', () => {
      const value: unknown = undefined;
      const result = when(value)
        .isType(isUndefined, () => 'is undefined')
        .otherwise(() => 'not undefined');

      expect(result).toBe('is undefined');
    });
  });
});

describe('Predicate combinators', () => {
  describe('all() - Logical AND', () => {
    it('should return true when all predicates pass', () => {
      const inRange = all([gt(0), lt(10)]);
      expect(inRange(5)).toBe(true);
    });

    it('should return false when any predicate fails', () => {
      const inRange = all([gt(0), lt(10)]);
      expect(inRange(15)).toBe(false);
      expect(inRange(-5)).toBe(false);
    });

    it('should return true for empty predicate array', () => {
      const alwaysTrue = all([]);
      expect(alwaysTrue(42)).toBe(true);
    });

    it('should work with when()', () => {
      const result = when(5)
        .is(all([gt(0), lt(10)]), then('in range'))
        .otherwise(then('out of range'));

      expect(result).toBe('in range');
    });
  });

  describe('any() - Logical OR', () => {
    it('should return true when any predicate passes', () => {
      const isPrime = any([eq(2), eq(3), eq(5), eq(7)]);
      expect(isPrime(3)).toBe(true);
      expect(isPrime(7)).toBe(true);
    });

    it('should return false when all predicates fail', () => {
      const isPrime = any([eq(2), eq(3), eq(5), eq(7)]);
      expect(isPrime(4)).toBe(false);
    });

    it('should return false for empty predicate array', () => {
      const alwaysFalse = any([]);
      expect(alwaysFalse(42)).toBe(false);
    });

    it('should work with when()', () => {
      const result = when(3)
        .is(any([eq(2), eq(3), eq(5)]), then('prime'))
        .otherwise(then('not prime'));

      expect(result).toBe('prime');
    });
  });

  describe('not() - Logical NOT', () => {
    it('should negate a predicate', () => {
      const notZero = not(eq(0));
      expect(notZero(0)).toBe(false);
      expect(notZero(1)).toBe(true);
    });

    it('should work with when()', () => {
      const result = when(5).is(not(eq(0)), then('not zero')).otherwise(then('zero'));

      expect(result).toBe('not zero');
    });

    it('should work with complex predicates', () => {
      const notInRange = not(all([gt(0), lt(10)]));
      expect(notInRange(15)).toBe(true);
      expect(notInRange(5)).toBe(false);
    });
  });
});

describe('Real-world use cases', () => {
  describe('HTTP status code handling', () => {
    const getStatusCategory = (status: number) =>
      when(status)
        .is(all([ge(200), lt(300)]), then('Success'))
        .is(all([ge(300), lt(400)]), then('Redirect'))
        .is(all([ge(400), lt(500)]), then('Client Error'))
        .is(all([ge(500), lt(600)]), then('Server Error'))
        .otherwise(then('Unknown'));

    it.each([
      [200, 'Success'],
      [301, 'Redirect'],
      [404, 'Client Error'],
      [500, 'Server Error'],
      [999, 'Unknown'],
    ])('should categorize %i as %s', (status, expected) => {
      expect(getStatusCategory(status)).toBe(expected);
    });
  });

  describe('Form validation', () => {
    const validateAge = (age: unknown) =>
      when(age)
        .isType(
          (v): v is number => typeof v === 'number',
          (v) =>
            when(v)
              .is(lt(0), then('Age cannot be negative'))
              .is(all([ge(0), lt(18)]), then('Must be 18 or older'))
              .is(gt(120), then('Invalid age'))
              .otherwise(then('Valid')),
        )
        .otherwise(() => 'Age must be a number');

    it.each([
      ['25', 'Age must be a number'],
      [-5, 'Age cannot be negative'],
      [15, 'Must be 18 or older'],
      [150, 'Invalid age'],
      [25, 'Valid'],
    ])('should validate %p as %s', (age, expected) => {
      expect(validateAge(age)).toBe(expected);
    });
  });

  describe('State machine', () => {
    type State = 'idle' | 'loading' | 'success' | 'error';
    type Action = 'start' | 'resolve' | 'reject' | 'reset';

    const transition = (state: State, action: Action): State =>
      when(state)
        .isValue(
          'idle',
          when(action).isValue('start', 'loading' as State).otherwise(() => state),
        )
        .isValue(
          'loading',
          when(action)
            .isValue('resolve', 'success' as State)
            .isValue('reject', 'error' as State)
            .otherwise(() => state),
        )
        .isValue(
          'success',
          when(action).isValue('reset', 'idle' as State).otherwise(() => state),
        )
        .isValue(
          'error',
          when(action).isValue('reset', 'idle' as State).otherwise(() => state),
        )
        .otherwise(() => state);

    it.each([
      ['idle', 'start', 'loading'],
      ['loading', 'resolve', 'success'],
      ['loading', 'reject', 'error'],
      ['success', 'reset', 'idle'],
      ['error', 'reset', 'idle'],
      ['idle', 'resolve', 'idle'],
    ] as const)('should transition from %s with %s to %s', (state, action, expected) => {
      expect(transition(state, action)).toBe(expected);
    });
  });
});

describe('New helper functions', () => {
  describe('between() - Range matching (inclusive)', () => {
    it.each([
      [50, 'in'],
      [0, 'in'],
      [100, 'in'],
      [-1, 'out'],
      [101, 'out'],
    ])('should evaluate between(0, 100) for %i as %s', (value, expected) => {
      const result = when(value).is(between(0, 100), then('in')).otherwise(then('out'));
      expect(result).toBe(expected);
    });
  });

  describe('betweenExclusive() - Range matching (exclusive)', () => {
    it.each([
      [50, 'in'],
      [0, 'out'],
      [100, 'out'],
      [-1, 'out'],
      [101, 'out'],
    ])('should evaluate betweenExclusive(0, 100) for %i as %s', (value, expected) => {
      const result = when(value).is(betweenExclusive(0, 100), then('in')).otherwise(then('out'));
      expect(result).toBe(expected);
    });
  });

  describe('oneOf() - Array membership', () => {
    it.each([
      ['active', 'valid'],
      ['deleted', 'invalid'],
    ])('should evaluate oneOf for %s as %s', (value, expected) => {
      const result = when(value)
        .is(oneOf(['active', 'pending', 'approved']), then('valid'))
        .otherwise(then('invalid'));
      expect(result).toBe(expected);
    });

    it.each([
      [3, 'prime'],
      [4, 'not prime'],
    ])('should evaluate oneOf for number %i as %s', (value, expected) => {
      const result = when(value).is(oneOf([2, 3, 5, 7]), then('prime')).otherwise(then('not prime'));
      expect(result).toBe(expected);
    });
  });

  describe('noneOf() - Array non-membership', () => {
    it.each([
      ['active', 'valid'],
      ['deleted', 'invalid'],
    ])('should evaluate noneOf for %s as %s', (value, expected) => {
      const result = when(value)
        .is(noneOf(['deleted', 'archived']), then('valid'))
        .otherwise(then('invalid'));
      expect(result).toBe(expected);
    });
  });

  describe('exhaustive() - Exhaustiveness checking', () => {
    it.each([
      ['unhandled', 'Unhandled case: "unhandled"'],
      [{ type: 'unknown' }, 'Unhandled case:'],
    ])('should throw error for %p', (value, expectedMessage) => {
      expect(() => {
        exhaustive(value as never);
      }).toThrow(expectedMessage);
    });

    it('works with union types for compile-time exhaustiveness', () => {
      // This demonstrates exhaustiveness checking with union types
      // In a real scenario, if you add a new status and forget to handle it,
      // TypeScript will show a compile error
      type Status = 'pending' | 'approved' | 'rejected';

      const getMessage = (status: Status): string => {
        if (status === 'pending') return 'Waiting';
        if (status === 'approved') return 'Approved';
        if (status === 'rejected') return 'Rejected';
        // At this point, status is narrowed to never
        return exhaustive(status);
      };

      expect(getMessage('pending')).toBe('Waiting');
      expect(getMessage('approved')).toBe('Approved');
      expect(getMessage('rejected')).toBe('Rejected');
    });
  });
});

describe('Edge cases', () => {
  it.each([
    [NaN, (v: number) => Number.isNaN(v), 'is NaN', 'not NaN', 'is NaN'],
    [Infinity, (v: number) => v === Infinity, 'infinity', 'not infinity', 'infinity'],
  ])('should handle %p special numeric values', (input, predicate, trueBranch, falseBranch, expected) => {
    const result = when(input).is(predicate, () => trueBranch).otherwise(() => falseBranch);
    expect(result).toBe(expected);
  });

  it('should handle empty string', () => {
    const result = when('').isValue('', 'empty').isValue('hello', 'hello').otherwise(() => 'other');
    expect(result).toBe('empty');
  });

  it.each([
    [0, 'positive zero'],
    [-0, 'negative zero'],
  ])('should handle %p zero values', (value, expected) => {
    const checkZero = (v: number) =>
      when(v)
        .is(
          (x) => Object.is(x, 0),
          () => 'positive zero',
        )
        .is(
          (x) => Object.is(x, -0),
          () => 'negative zero',
        )
        .otherwise(() => 'not zero');

    expect(checkZero(value)).toBe(expected);
  });
});
