type When<T> = {
  on: <A>(
    prediction: (v: T) => boolean,
    producer: () => A
  ) => ChainedWhen<T, A>;
};

type ChainedWhen<T, R> = {
  on: <A>(
    prediction: (v: T) => boolean,
    producer: () => A
  ) => ChainedWhen<T, R | A>;
  otherwise: <A>(producer: () => A) => R | A;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const match = <T, R>(value: any): ChainedWhen<T, R> => ({
  on: <A>() => match<T, R | A>(value),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  otherwise: <A>(): A | R => value,
});

const chain = <T, R>(value: T): ChainedWhen<T, R> => ({
  on: <A>(prediction: (v: T) => boolean, producer: () => A) =>
    prediction(value) ? match(producer()) : chain<T, A | R>(value),
  otherwise: <A>(producer: () => A) => producer(),
});

export const when = <T>(value: T): When<T> => ({
  on: <A>(prediction: (v: T) => boolean, producer: () => A) =>
    prediction(value) ? match<T, A>(producer()) : chain<T, A>(value),
});

export const eq = <T>(value1: T) => (value2: T): boolean => value1 === value2;
export const ne = <T>(value1: T) => (value2: T): boolean => value1 !== value2;
export const gt = <T>(value1: T) => (value2: T): boolean => value1 > value2;
export const lt = <T>(value1: T) => (value2: T): boolean => value1 < value2;
export const ge = <T>(value1: T) => (value2: T): boolean => value1 >= value2;
export const le = <T>(value1: T) => (value2: T): boolean => value1 <= value2;
