import {
  Primitive,
  Types,
  UnknownMap,
  UnknownSet,
  toStringType,
} from "./types";
import { isDraftable } from "./draft";
import { Traps_self } from "./traps";

export type FreezeOnce<T> = T extends Freeze<infer Q> ? Freeze<Q> : Freeze<T>;

export type Freeze<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<Freeze<U>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<Freeze<K>, Freeze<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<Freeze<K>, Freeze<V>>
  : T extends Set<infer M>
  ? ReadonlySet<Freeze<M>>
  : T extends ReadonlySet<infer M>
  ? ReadonlySet<Freeze<M>>
  : T extends Function
  ? T
  : T extends object
  ? FreezedObject<T>
  : T;

export type FreezedObject<T> = { readonly [K in keyof T]: Freeze<T[K]> };

export type UnFreeze<T> = T extends Primitive
  ? T
  : T extends Array<infer Q>
  ? Array<UnFreeze<Q>>
  : T extends Map<infer K, infer V>
  ? Map<UnFreeze<K>, UnFreeze<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? Map<UnFreeze<K>, UnFreeze<V>>
  : T extends Set<infer M>
  ? Set<UnFreeze<M>>
  : T extends ReadonlySet<infer M>
  ? Set<UnFreeze<M>>
  : T extends Function
  ? T
  : T extends object
  ? UnFreezedObject<T>
  : T;

export type UnFreezedObject<T> = { -readonly [K in keyof T]: UnFreeze<T[K]> };

const errFrozen = () => {
  throw Error("This object has been frozen and should not be mutated");
};

export function freeze<T>(
  obj: T,
  runtime: boolean = false,
  deep: boolean = false
): FreezeOnce<T> {
  if (
    runtime &&
    isDraftable(obj) &&
    !Object.isFrozen(obj) &&
    !(Traps_self in (obj as object))
  ) {
    switch (toStringType(obj)) {
      case Types.Map:
        const map = obj as UnknownMap;
        map.set = map.clear = map.delete = errFrozen;
        Object.freeze(obj);
        if (deep) {
          map.forEach((v, k) => {
            freeze(k, true, true);
            freeze(v, true, true);
          });
        }
        break;
      case Types.Set:
        const set = obj as UnknownSet;
        set.add = set.clear = set.delete = errFrozen;
        Object.freeze(obj);
        if (deep) {
          set.forEach((v) => freeze(v, true, true));
        }
        break;
      default:
        Object.freeze(obj);
        if (deep) {
          const keys = Reflect.ownKeys(obj as object);
          for (let i = 0; i !== keys.length; i++) {
            freeze(obj[keys[i] as keyof T], true, true);
          }
        }
    }
  }
  return obj as FreezeOnce<T>;
}

export function unfreeze<T>(obj: T) {
  if (Object.isFrozen(obj)) {
    throw new Error(
      "This object has been frozen at runtime and can't be unfreezed"
    );
  }
  return obj as UnFreeze<T>;
}
