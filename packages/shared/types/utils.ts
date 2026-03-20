/* =============== common helpers =============== */
type MaybeArray<T> = T[] | readonly T[] | T;
type MaybePromise<T> = T | Promise<T>;

/* =============== recursion helpers =============== */
type StopRecursion =
  | null
  | string
  | number
  | boolean
  | symbol
  | bigint
  | Date
  | RegExp
  | ((...args: any[]) => any);

type DeepPartial<T> = T extends StopRecursion | undefined
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends unknown
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : never;

type DeepRequired<T> = T extends StopRecursion
  ? T
  : T extends undefined
    ? never
    : T extends readonly (infer U)[]
      ? readonly DeepRequired<U>[]
      : T extends unknown
        ? { [K in keyof T]-?: DeepRequired<T[K]> }
        : never;

type DeepReadonly<T> = T extends StopRecursion | undefined
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T extends unknown
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : never;

/* =============== merge helpers =============== */
type WithDefault<T, D> = [T] extends [never] ? D : T;

type UnionToIntersection<U> = (U extends never ? never : (k: U) => void) extends (
  k: infer I
) => void
  ? I
  : never;

export type {
  MaybeArray,
  MaybePromise,
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  WithDefault,
  UnionToIntersection,
};
