type When<T> = {
  is: <R>(prediction: (v: T) => boolean, producer: () => R) => Chain<T, R>;
};

type Chain<T, R> = {
  is: (prediction: (v: T) => boolean, producer: () => R) => Chain<T, R>;
  default: (producer: () => R) => R;
};

const match = <T, R>(value: R): Chain<T, R> => ({
  is: () => match<T, R>(value),
  default: (): R => value,
});

const chain = <T, R>(value: T): Chain<T, R> => ({
  is: (prediction: (v: T) => boolean, producer: () => R) =>
    prediction(value) ? match(producer()) : chain<T, R>(value),
  default: (producer: () => R) => producer(),
});

export const when = <T>(value: T): When<T> => ({
  is: <R>(prediction: (v: T) => boolean, producer: () => R) =>
    prediction(value) ? match<T, R>(producer()) : chain<T, R>(value),
});

export const then = <T>(value: T) => (): T => value;

export const eq = <T>(value1: T) => (value2: T): boolean => value1 === value2;
export const ne = <T>(value1: T) => (value2: T): boolean => value1 !== value2;
export const gt = <T>(value1: T) => (value2: T): boolean => value1 < value2;
export const lt = <T>(value1: T) => (value2: T): boolean => value1 > value2;
export const ge = <T>(value1: T) => (value2: T): boolean => value1 <= value2;
export const le = <T>(value1: T) => (value2: T): boolean => value1 >= value2;
