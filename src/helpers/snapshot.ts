import { shallowClone } from "../internals/copy";
import {
  Prop,
  Types,
  UnknownMap,
  UnknownObj,
  UnknownSet,
  toStringType,
} from "./types";
import { isDraft } from "./draft";
import { original, target } from "./traps";

export function snapshot<T>(obj: T): T {
  if (!isDraft(obj)) return obj;
  function deep<Q>(v: unknown, k: unknown, clone: Q) {
    if (clone === null) return;
    const type = typeof clone;
    if (type === Types.object || type === Types.function) {
      const typeStr = toStringType(clone);
      const child = cloneOrOriginal(v);
      if (typeStr === Types.Map) {
        (clone as unknown as UnknownMap).set(k, child);
      } else if (typeStr === Types.Set) {
        (clone as unknown as UnknownSet).add(child);
      } else {
        (clone as UnknownObj)[k as Prop] = child;
      }
    }
  }
  // if it already has a clone then clone it again,
  // else return the original
  function cloneOrOriginal(t: unknown) {
    const ori = original(t);
    return target(t) === ori ? ori : shallowClone(t, undefined, deep);
  }
  return cloneOrOriginal(obj) as T;
}
