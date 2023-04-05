export enum Types {
  primitive = "primitive",
  function = "function",
  object = "object",
  Object = "[object Object]",
  Array = "[object Array]",
  String = "[object String]",
  Boolean = "[object Boolean]",
  Number = "[object Number]",
  Date = "[object Date]",
  RegExp = "[object RegExp]",
  Map = "[object Map]",
  Set = "[object Set]",
  Promise = "[object Promise]",
}

export type Primitive = null | undefined | boolean | number | string | symbol;
export type Prop = number | string | symbol;
export type UnknownObj = Record<Prop, unknown>;
export type UnknownArr = Array<unknown>;
export type UnknownMap = Map<unknown, unknown>;
export type UnknownSet = Set<unknown>;

const _toString = Object.prototype.toString;

export function toStringType<T>(x: T) {
  return _toString.call(x);
}

export function toStringArchtype<T>(x: T) {
  if (isPrimitive(x)) return "primitive";
  if (typeof x === "function") return "function";
  return _toString.call(x);
}

export function isPrimitive(x: unknown): x is Primitive {
  if (x === null) return true;
  const type = typeof x;
  if (type !== Types.function && type !== Types.object) return true;
  return false;
}
