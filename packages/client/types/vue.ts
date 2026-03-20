import type { Component, ComputedRef, MaybeRefOrGetter, readonly } from "vue";
import type { UnionToIntersection } from "@vitepress-theme-index/shared";

type VueReadonly<T extends object> = ReturnType<typeof readonly<T>>;

type CustomComputedRef<Value, Custom> = ComputedRef<Value> & Custom;

type EmitsTypeFromHooks<Hooks> = UnionToIntersection<
  {
    [K in keyof Hooks]: Hooks[K] extends (...args: infer Args) => infer R
      ? (e: K, ...args: Args) => R
      : never;
  }[keyof Hooks]
>;

type ToMaybeRefOrGetter<T> = [T] extends [MaybeRefOrGetter<infer R>]
  ? [T] extends [R]
    ? MaybeRefOrGetter<T>
    : T
  : never;

type ToMaybeRefOrGetterState<T, Ks extends keyof T = keyof T> = {
  [K in keyof T]: K extends Ks ? ToMaybeRefOrGetter<T[K]> : T[K];
};

type HasSlots<Optional extends string = never, Required extends string = never> = {
  slots: { default: Component } & { [K in Required]: Component } & { [K in Optional]?: Component };
};

export type {
  VueReadonly,
  CustomComputedRef,
  EmitsTypeFromHooks,
  ToMaybeRefOrGetterState,
  HasSlots,
};
