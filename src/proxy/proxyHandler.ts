import { AllData, ItemData, Link, createProxy } from "./createProxy";
import {
  Traps_all_data,
  Traps_item_data,
  Traps_self,
  Traps_target,
} from "../helpers/traps";
import { PatchStore } from "../core/patches";
import {
  Primitive,
  Prop,
  Types,
  UnknownArr,
  UnknownMap,
  UnknownSet,
  isPrimitive,
} from "../helpers/types";
import { Actions, walkParents } from "../internals/walkParents";

export const enum Methods {
  get = "get",
  set = "set",
  add = "add",
  delete = "delete",
  clear = "clear",
  values = "values",
  entries = "entries",
  forEach = "forEach",
}

export type ItemDataWrapper = [ItemData];

export class CreateProxyHandler {
  state: unknown;
  data: AllData;
  pStore: PatchStore | null;
  proxify: typeof createProxy;

  constructor(
    state: unknown,
    data: AllData,
    pStore: PatchStore | null,
    proxify: typeof createProxy
  ) {
    this.state = state;
    this.data = data;
    this.pStore = pStore;
    this.proxify = proxify;
  }

  get(wrap: ItemDataWrapper, p: Prop, r: object): Primitive | object {
    const state = this.state;
    const data = this.data;
    const pStore = this.pStore;
    const proxify = this.proxify;
    const handler = this;
    const itemData = wrap[0];
    const t = itemData.original as object;
    if (p === Traps_self) return t;
    if (p === Traps_item_data) return itemData;
    if (p === Traps_all_data) return data;
    const actualTarget = itemData.shallow || t;
    if (p === Traps_target) return actualTarget;
    const v = Reflect.get(actualTarget, p, r);
    if (isPrimitive(v)) return v;
    const type = itemData.type;
    if (type === Types.Map) {
      if (typeof v === Types.function) {
        if (p === Methods.set) {
          return function (k: Prop, x: unknown) {
            if ((actualTarget as UnknownMap).get(k) !== x)
              walkParents(state, Actions.set_map, data, pStore, t, k, x);
            return r;
          };
        } else if (p === Methods.delete) {
          return function (k: Prop) {
            const result = (actualTarget as UnknownMap).has(k);
            if (result)
              walkParents(state, Actions.delete_map, data, pStore, t, k);
            return result;
          };
        } else if (p === Methods.clear) {
          return function () {
            walkParents(state, Actions.clear_map, data, pStore, t);
          };
        } else if (p === Methods.get) {
          return function (k: Prop) {
            const x = (actualTarget as UnknownMap).get(k);
            return isPrimitive(x)
              ? x
              : proxify(x as object, data, handler, t, k).proxy;
          };
        } else if (p === Methods.values || p === Methods.entries) {
          return function* iterator() {
            const isEntries = p === Methods.entries;
            const entries = (actualTarget as UnknownMap).entries();
            let entry;
            let proxy;
            let links;
            for (entry of entries) {
              const entryV = entry[1] as object;
              proxy = isPrimitive(entryV)
                ? entryV
                : proxify(entryV, data, handler, t, entry[0] as Link).proxy;
              yield isEntries ? [links, proxy] : proxy;
            }
          };
        } else if (p === Methods.forEach) {
          return function forEach(fn: Function) {
            (actualTarget as Map<object, object>).forEach(function (x, k) {
              fn(isPrimitive(x) ? x : proxify(x, data, handler, t, k).proxy);
            });
          };
        } else {
          return v.bind(proxify(t, data, handler).proxy);
        }
      }
    } else if (type === Types.Set) {
      const UND = undefined;
      if (typeof v === Types.function) {
        if (p === Methods.add) {
          return function (x: unknown) {
            if (!(actualTarget as UnknownSet).has(x))
              walkParents(state, Actions.add_set, data, pStore, t, UND, x);
            return r;
          };
        } else if (p === Methods.delete) {
          return function (x: unknown) {
            const result = (actualTarget as UnknownSet).has(x);
            if (result)
              walkParents(state, Actions.delete_set, data, pStore, t, UND, x);
            return result;
          };
        } else if (p === Methods.clear) {
          return function () {
            walkParents(state, Actions.clear_set, data, pStore, t);
          };
        } else if (p === Methods.values || p === Methods.entries) {
          return function* iterator() {
            const isEntries = p === Methods.entries;
            // in the current version, maps and sets are used directly as targets even if frozen,
            // because this has no side effects and simplifies the logic a lot;
            // however, if frozen sets were to be preventively shallow cloned,
            // it would be necessary to spread the values() iterator into an array to avoid an infinite loop
            const values = (actualTarget as UnknownSet).values();
            let value;
            let proxy;
            for (value of values) {
              proxy = isPrimitive(value)
                ? value
                : proxify(value as object, data, handler, t, value as Link)
                    .proxy;
              yield isEntries ? [proxy, proxy] : proxy;
            }
          };
        } else if (p === Methods.forEach) {
          return function forEach(fn: Function) {
            (actualTarget as Set<object>).forEach(function (x) {
              fn(isPrimitive(x) ? x : proxify(x, data, handler, t, x).proxy);
            });
          };
        } else {
          return v.bind(proxify(t, data, handler).proxy);
        }
      }
    }
    if (type === Types.Date) {
      if (typeof v === Types.function) {
        if ((p as string).indexOf(Methods.set) === 0) {
          return function (...args: unknown[]) {
            walkParents(state, Actions.set_date, data, pStore, t, p, args);
            return r;
          };
        } else {
          return (actualTarget as Date)[p as keyof Date].bind(actualTarget);
        }
      }
    } else if (typeof v === Types.function) {
      const itemData = proxify(t, data, handler);
      if (type === Types.Array) {
        itemData.inverseLength = (t as UnknownArr).length;
      }
      return v.bind(itemData.proxy);
    }
    return proxify(v, data, handler, t, p).proxy;
  }
  set(wrap: ItemDataWrapper, p: Prop, v: unknown, r: object) {
    const state = this.state;
    const data = this.data;
    const pStore = this.pStore;
    const itemData = wrap[0];
    const t = itemData.original as object;
    if (Reflect.get(t, p, r) !== v) {
      walkParents(state, Actions.set, data, pStore, t, p, v);
    }
    return true;
  }
  deleteProperty(wrap: ItemDataWrapper, p: Prop) {
    const state = this.state;
    const data = this.data;
    const pStore = this.pStore;
    const itemData = wrap[0];
    const t = itemData.original as object;
    walkParents(state, Actions.delete, data, pStore, t, p);
    return true;
  }
  has(wrap: ItemDataWrapper, p: Prop) {
    if (
      p === Traps_self ||
      p === Traps_target ||
      p === Traps_item_data ||
      p === Traps_all_data
    )
      return true;
    const itemData = wrap[0];
    const t = itemData.original as object;
    const actualTarget = itemData.shallow || t;
    return p in actualTarget;
  }
  ownKeys(wrap: ItemDataWrapper) {
    const itemData = wrap[0];
    const t = itemData.original as object;
    const actualTarget = itemData.shallow || t;
    return Reflect.ownKeys(actualTarget);
  }
  getOwnPropertyDescriptor(wrap: ItemDataWrapper, p: Prop) {
    const itemData = wrap[0];
    const t = itemData.original as object;
    const actualTarget = itemData.shallow || t;
    const descriptor = Object.getOwnPropertyDescriptor(actualTarget, p);
    if (!descriptor) return undefined;
    return {
      writable: true,
      configurable:
        p === "length" && Array.isArray(t) ? descriptor.configurable : true,
      enumerable: descriptor.enumerable,
      value: actualTarget[p as keyof typeof actualTarget],
    };
  }
  getPrototypeOf(wrap: ItemDataWrapper) {
    const itemData = wrap[0];
    const t = itemData.original as object;
    return Object.getPrototypeOf(t);
  }
}
