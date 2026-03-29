/* =============== common helpers =============== */
type MaybeArray<T> = T[] | readonly T[] | T;
type MaybeRecord<T> = T | Record<string, T>;
type MaybePromise<T> = T | Promise<T>;

/* =============== recursion helpers =============== */
type PrimitiveLike =
  | null
  | string
  | number
  | boolean
  | symbol
  | bigint
  | any[]
  | ((...args: any[]) => any)
  | Date
  | RegExp;

type TransformMode = "partial" | "required" | "readonly";

type TransformMethod<
  T extends object,
  ORIGIN = PrimitiveLike,
  MODE extends TransformMode = "partial",
> = {
  partial: { [K in keyof T]?: DeepTransform<T[K], ORIGIN, MODE> };
  required: { [K in keyof T]-?: DeepTransform<T[K], ORIGIN, MODE> };
  readonly: { readonly [K in keyof T]: DeepTransform<T[K], ORIGIN, MODE> };
}[MODE];

type DeepTransform<
  T,
  ORIGIN = PrimitiveLike,
  MODE extends TransformMode = "partial",
> = T extends ORIGIN ? T : T extends object ? TransformMethod<T, ORIGIN, MODE> : never;

type DeepPartial<T> = DeepTransform<T, PrimitiveLike | undefined>;
type DeepRequired<T> = DeepTransform<T, PrimitiveLike, "required">;
type DeepReadonly<T> = DeepTransform<T, PrimitiveLike, "readonly">;

/* =============== merge helpers =============== */
type WithDefault<T, D> = [T] extends [never] ? D : T;

type UnionToIntersection<U> = (U extends never ? never : (k: U) => void) extends (
  k: infer I
) => void
  ? I
  : never;

type DefineAble<T> = T | (() => T) | (() => Promise<T>);

export type {
  MaybeArray,
  MaybeRecord,
  MaybePromise,
  DefineAble,
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  WithDefault,
  UnionToIntersection,
};
