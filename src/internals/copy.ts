import { Settings } from "../helpers/settings";
import {
  Primitive,
  Types,
  UnknownMap,
  UnknownObj,
  UnknownSet,
  toStringArchtype,
} from "../helpers/types";

type ForEach = (v: unknown, k: unknown | undefined, c: unknown) => void;

function copyProps<F extends object, T extends object>(
  from: F,
  to: T,
  forEach?: ForEach
) {
  const symbols = Object.getOwnPropertySymbols(from);
  let key,
    i = 0,
    l = symbols.length;
  for (; i !== l; i++) {
    key = symbols[i];
    const v = (from as UnknownObj)[key];
    (to as UnknownObj)[key] = v;
    if (forEach) forEach(v, key, to);
  }
  const keys = Object.keys(from);
  l = keys.length;
  i = 0;
  for (; i !== l; i++) {
    key = keys[i];
    const v = (from as UnknownObj)[key];
    (to as UnknownObj)[key] = v;
    if (forEach) forEach(v, key, to);
  }
  return to;
}

function strictCopyProps<F>(from: F, forEach?: ForEach) {
  const descriptors = Object.getOwnPropertyDescriptors(from);
  // first we loop string and number props
  for (const key in descriptors) {
    const d = descriptors[key];
    d.writable = true;
    if (key !== "length") d.configurable = true;
    d.value = d.value || from[key as keyof typeof from];
    if (forEach) forEach(d.value, "value", d);
  }
  // then we loop symbols
  const symbols = Object.getOwnPropertySymbols(descriptors),
    l = symbols.length;
  let i = 0,
    key: symbol;
  for (; i !== l; i++) {
    key = symbols[i];
    const d = descriptors[key as keyof typeof descriptors];
    d.writable = true;
    d.configurable = true;
    d.value = d.value || from[key as keyof typeof from];
    if (forEach) forEach(d.value, "value", d);
  }
  return Object.create(Object.getPrototypeOf(from), descriptors);
}

export function shallowClone<T>(x: T, type?: Types, forEach?: ForEach): object {
  const fn =
    cloneFns[type || (toStringArchtype(x) as Types)] || cloneFns[Types.Object];
  return (fn as Function)(x, forEach);
}

const cloneFns: Partial<Record<Types, Function>> = {
  [Types.primitive](x: Primitive, _?: ForEach) {
    return x;
  },
  [Types.function](x: Function, forEach?: ForEach) {
    return copyProps(x, x.bind(null), forEach);
  },
  [Types.Object](x: Object, forEach?: ForEach) {
    if (!Settings.strictCopy) {
      const constructor = x.constructor;
      if (!constructor || constructor.name === "Object") {
        return copyProps(x, {}, forEach);
      }
      return copyProps(x, Object.create(Object.getPrototypeOf(x)), forEach);
    } else {
      return strictCopyProps(x, forEach);
    }
  },
  [Types.Array](x: Array<unknown>, forEach?: ForEach) {
    const copy = x.slice(0);
    if (forEach) copy.forEach(forEach);
    return copy;
  },
  [Types.String](x: String, forEach?: ForEach) {
    return copyProps(x, new String(x.toString()), forEach);
  },
  [Types.Boolean](x: Boolean, forEach?: ForEach) {
    return copyProps(x, new Boolean(!!x), forEach);
  },
  [Types.Number](x: Number, forEach?: ForEach) {
    return copyProps(x, new Number(x.valueOf()), forEach);
  },
  [Types.Date](x: Date, forEach?: ForEach) {
    return copyProps(x, new Date(+x), forEach);
  },
  [Types.RegExp](x: RegExp, forEach?: ForEach) {
    return copyProps(x, new RegExp(x.source, x.flags), forEach);
  },
  [Types.Map](x: UnknownMap, forEach?: ForEach) {
    const shallow = new Map();
    x.forEach(function (item, key) {
      shallow.set(key, item);
      if (forEach) forEach(item, key, shallow);
    });
    return shallow;
  },
  [Types.Set](x: UnknownSet, forEach?: ForEach) {
    const shallow = new Set();
    x.forEach(function (item) {
      shallow.add(item);
      if (forEach) forEach(item, undefined, shallow);
    });
    return shallow;
  },
};
