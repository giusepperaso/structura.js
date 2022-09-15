const enum Types {
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
}

const enum Methods {
  get = "get",
  set = "set",
  add = "add",
  delete = "delete",
  clear = "clear",
  values = "values",
  entries = "entries",
  forEach = "forEach",
}

const enum Actions {
  set,
  set_map,
  add_set,
  delete,
  delete_map,
  delete_set,
  clear_map,
  clear_set,
  append,
}

const Traps_self = Symbol();
const Traps_target = Symbol();
const Traps_data = Symbol();

export type Primitive = null | undefined | string | number | boolean | symbol;
export type Target = UnknownArray | UnknownMap | UnknownSet | Object;
export type Prop = string | number | symbol;
export type UnknownObj = Record<Prop, unknown>;
export type UnknownMap = Map<unknown, unknown>;
export type UnknownSet = Set<unknown>;
export type UnknownArray = Array<unknown>;

export type Producer<T, Q> = (draft: UnFreeze<T>) => Q | void;
export type ProduceOptions = { proxify?: typeof createProxy };
export type ProduceReturn<T, Q> = FreezeOnce<Q extends void ? T : Q>;

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
  : { readonly [K in keyof T]: Freeze<T[K]> };

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
  : { -readonly [K in keyof T]: UnFreeze<T[K]> };

export function produce<T, Q>(
  state: T,
  producer: Producer<T, Q>,
  { proxify = createProxy }: ProduceOptions = {}
): ProduceReturn<T, Q> {
  type R = ProduceReturn<T, Q>;
  if (isPrimitive(state)) return producer(state as UnFreeze<T>) as R;
  const data = new WeakMap();
  const handler = {
    get(t: Target, p: Prop, r: Target) {
      if (p === Traps_self) return t;
      if (p === Traps_data) return data.get(t);
      const actualTarget = data.get(t)?.shallow || t;
      if (p === Traps_target) return actualTarget;
      const v = Reflect.get(actualTarget, p, r);
      if (isPrimitive(v)) return v;
      const type = getTypeString(t);
      if (type === Types.Map) {
        if (typeof v === Types.function) {
          if (p === Methods.set) {
            return function (k: Prop, _v: unknown) {
              if (actualTarget.get(k) !== _v)
                walkParents(Actions.set_map, data, t, k, _v);
              return r;
            };
          } else if (p === Methods.delete) {
            return function (k: Prop) {
              const result = actualTarget.has(k);
              if (result) walkParents(Actions.delete_map, data, t, k);
              return result;
            };
          } else if (p === Methods.clear) {
            return function () {
              walkParents(Actions.clear_map, data, t);
            };
          } else if (p === Methods.get) {
            return function (k: Prop) {
              const _v = actualTarget.get(k);
              return !isPrimitive(_v)
                ? proxify(_v, data, handler, t, k).proxy
                : _v;
            };
          } else if (p === Methods.values || p === Methods.entries) {
            return function* iterator() {
              const isEntries = p === Methods.entries;
              const entries = actualTarget.entries();
              let entry;
              let proxy;
              let links;
              for (entry of entries) {
                proxy = proxify(entry[1], data, handler, t, entry[0]).proxy;
                yield isEntries ? [links, proxy] : proxy;
              }
            };
          } else if (p === Methods.forEach) {
            return function forEach(fn: Function) {
              actualTarget.forEach(function (_v: Target, k: Prop) {
                fn(proxify(_v, data, handler, t, k).proxy);
              });
            };
          } else {
            return v.bind(proxify(t, data, handler).proxy);
          }
        }
      } else if (type === Types.Set) {
        if (typeof v === Types.function) {
          if (p === Methods.add) {
            return function (_v: unknown) {
              if (!actualTarget.has(_v))
                walkParents(Actions.add_set, data, t, undefined, _v);
              return r;
            };
          } else if (p === Methods.delete) {
            return function (_v: unknown) {
              const result = actualTarget.has(_v);
              if (result)
                walkParents(Actions.delete_set, data, t, undefined, _v);
              return result;
            };
          } else if (p === Methods.clear) {
            return function () {
              walkParents(Actions.clear_set, data, t);
            };
          } else if (p === Methods.values || p === Methods.entries) {
            return function* iterator() {
              const isEntries = p === Methods.entries;
              const values = actualTarget.values();
              let value;
              let proxy;
              for (value of values) {
                proxy = proxify(value, data, handler, t, value).proxy;
                yield isEntries ? [proxy, proxy] : proxy;
              }
            };
          } else if (p === Methods.forEach) {
            return function forEach(fn: Function) {
              actualTarget.forEach(function (_v: Target) {
                fn(proxify(_v, data, handler, t, _v).proxy);
              });
            };
          } else {
            return v.bind(proxify(t, data, handler).proxy);
          }
        }
      } else if (typeof v === Types.function) {
        return v.bind(proxify(t, data, handler).proxy);
      } else {
        return proxify(v, data, handler, t, p).proxy;
      }
    },
    set(t: Target, p: Prop, v: unknown, r: Target) {
      if (Reflect.get(t, p, r) !== v) walkParents(Actions.set, data, t, p, v);
      return true;
    },
    deleteProperty(t: Target, p: Prop) {
      walkParents(Actions.delete, data, t, p);
      return true;
    },
  };

  const currData = proxify(state as Target, data, handler);

  const result = producer(currData.proxy as UnFreeze<T>);

  if (typeof result !== "undefined") {
    return target(result) as R;
  } else if (currData.shallow === null) {
    return state as R;
  } else {
    return target(currData.shallow) as R;
  }
}

export function target<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return obj;
  return (obj as T & { [Traps_target]: T })[Traps_target] || obj;
}

export function original<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return obj;
  return (obj as T & { [Traps_self]: T })[Traps_self] || obj;
}

export function data<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return obj;
  return (obj as T & { [Traps_data]: T })[Traps_data] || obj;
}

export type Data = WeakMap<Target, TargetData>;

export type Link = Prop | Target;

export type LinkSet = Set<Link>;

export type TargetData = {
  proxy: Target;
  shallow: Target | null;
  parents: Map<Target, LinkSet>;
  children: WeakSet<Object>;
};

export type CreateProxyArgs = [Target, Data, ProxyHandler<Target>];
export type CreateProxy =
  | ((...args: [...CreateProxyArgs, Target?, Link?]) => TargetData)
  | ((...args: CreateProxyArgs) => TargetData);

export const createProxy: CreateProxy = function (
  obj,
  data,
  handler,
  parent,
  link
) {
  let currData: TargetData;
  if (data.has(obj)) {
    currData = data.get(obj) as TargetData;
    if (parent && link) {
      const parents = currData.parents;
      if (parents.has(parent)) {
        (parents.get(parent) as LinkSet).add(link);
      } else {
        parents.set(parent, new Set([link]));
      }
    }
  } else {
    currData = {
      proxy: new Proxy(obj, handler),
      shallow: null,
      parents: parent ? new Map([[parent, new Set([link])]]) : new Map(),
      children: new WeakSet(),
    };
    data.set(obj, currData);
  }
  return currData;
};

function walkParents(
  action: Actions,
  data: Data,
  t: Target,
  p?: Prop,
  v?: unknown,
  links?: LinkSet,
  child?: Target
) {
  const currData = data.get(t);
  if (!currData) throw new Error("Missing data from current object");
  let shallow = currData.shallow;
  let type = "";
  if (shallow === null) {
    type = getTypeString(t);
    shallow = currData.shallow = shallowClone(t, type as Types);
  }
  function actionLink(action: "add" | "delete", link: Link, v: unknown) {
    const childData = data.get(v as Target);
    if (childData) {
      const childParents = childData.parents;
      if (childParents && childParents.has(t)) {
        const linkSet = childParents.get(t) as LinkSet;
        linkSet[action](link);
        if (!linkSet.size) childParents.delete(t);
      }
    }
  }
  if (action === Actions.set) {
    const actualValue = target(v);
    actionLink("add", p as Prop, actualValue);
    (shallow as UnknownObj)[p as Prop] = actualValue;
  } else if (action === Actions.delete) {
    const actualValue = (shallow as UnknownObj)[p as Prop];
    actionLink("delete", p as Prop, actualValue);
    delete (shallow as UnknownObj)[p as Prop];
  } else if (action === Actions.set_map) {
    const actualValue = target(v);
    actionLink("add", p as Prop, actualValue);
    (shallow as UnknownMap).set(p, actualValue);
  } else if (action === Actions.delete_map) {
    const actualValue = (shallow as UnknownMap).get(p);
    actionLink("delete", p as Prop, actualValue);
    (shallow as UnknownMap).delete(p);
  } else if (action === Actions.clear_map) {
    for (const entry of (shallow as UnknownMap).entries()) {
      actionLink("delete", entry[0] as Link, target(entry[1]));
    }
    (shallow as UnknownMap).clear();
  } else if (action === Actions.add_set) {
    const actualValue = target(v) as Link;
    actionLink("add", actualValue, actualValue);
    (shallow as UnknownSet).add(actualValue);
  } else if (action === Actions.delete_set) {
    const actualValue = target(v) as Link;
    actionLink("delete", actualValue, actualValue);
    (shallow as UnknownSet).delete(actualValue);
  } else if (action === Actions.clear_set) {
    for (const value of (shallow as UnknownSet).values()) {
      const actualValue = target(value) as Link;
      actionLink("delete", actualValue, actualValue);
    }
    (shallow as UnknownSet).clear();
  } else if (action === Actions.append) {
    const children = currData.children;
    if (children.has(child as Target)) return;
    children.add(child as Target);
    if (links) {
      type = type || getTypeString(t);
      if (type === Types.Map) {
        for (const link of links.values()) {
          (shallow as UnknownMap).set(link, child);
        }
      } else if (type === Types.Set) {
        for (const link of links.values()) {
          (shallow as UnknownSet).delete(link);
          (shallow as UnknownSet).add(child); // insertion order is not mantained in sets
        }
      } else {
        for (const link of links.values()) {
          (shallow as UnknownObj)[link as Prop] = child;
        }
      }
    }
  }
  for (const [parent, links] of currData.parents.entries()) {
    walkParents(Actions.append, data, parent, p, v, links, shallow as Target);
  }
}

function isPrimitive(x: unknown): x is Primitive {
  if (x === null) return true;
  const type = typeof x;
  if (type !== Types.function && type !== Types.object) return true;
  return false;
}

const toString = Object.prototype.toString;

function getTypeString(x: Object) {
  return toString.call(x);
}

function copyProps(from: Object, to: Object) {
  const keys = Object.keys(from);
  const l = keys.length;
  let i = 0;
  let key;
  for (; i < l; i++) {
    key = keys[i];
    (to as UnknownObj)[key] = (from as UnknownObj)[key];
  }
  const symbols = Object.getOwnPropertySymbols(from);
  for (key of symbols) {
    (to as UnknownObj)[key] = (from as UnknownObj)[key];
  }
  return to;
}

function shallowClone(
  x: Target | Exclude<Primitive, null | undefined>,
  type?: Types
): Target {
  return (cloneTypes[(type || Types.Object) as Types] as Function)(x);
}

const cloneTypes: Partial<Record<Types, Function>> = {
  [Types.primitive](x: Primitive) {
    return x;
  },
  [Types.Object](x: Object) {
    return copyProps(x, Object.create(Object.getPrototypeOf(x)));
  },
  [Types.Array](x: Array<unknown>) {
    return x.slice(0);
  },
  [Types.String](x: String) {
    return copyProps(x, new String(x.toString()));
  },
  [Types.Boolean](x: Boolean) {
    return copyProps(x, new Boolean(!!x));
  },
  [Types.Number](x: Number) {
    return copyProps(x, new Number(x.valueOf()));
  },
  [Types.Date](x: Date) {
    return copyProps(x, new Date(+x));
  },
  [Types.RegExp](x: RegExp) {
    return copyProps(x, new RegExp(x.source, x.flags));
  },
  [Types.Map](x: UnknownMap) {
    const shallow = new Map();
    x.forEach(function (item, key) {
      shallow.set(key, item);
    });
    return shallow;
  },
  [Types.Set](x: UnknownSet) {
    const shallow = new Set();
    x.forEach(function (item) {
      shallow.add(item);
    });
    return shallow;
  },
};
