const enum Types {
  primitive = "primitive",
  function = "function",
  Function = "[object Function]",
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
  clear,
  append,
}

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
      if (p === self) return t;
      const actualTarget = data.get(t)?.shallow || t;
      if (p === actual) return actualTarget;
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
              walkParents(Actions.clear, data, t);
            };
          } else if (p === Methods.get) {
            return function (k: Prop) {
              const _v = actualTarget.get(k);
              return !isPrimitive(_v)
                ? proxify(_v, data, handler, { obj: t, link: k }).proxy
                : _v;
            };
          } else if (p === Methods.values || p === Methods.entries) {
            return function* iterator() {
              const isEntries = p === Methods.entries;
              const entries = actualTarget.entries();
              let entry;
              let proxy;
              let parent;
              let link;
              for (entry of entries) {
                link = entry[0];
                parent = {
                  obj: t,
                  link,
                };
                proxy = proxify(entry[1], data, handler, parent).proxy;
                yield isEntries ? [link, proxy] : proxy;
              }
            };
          } else if (p === Methods.forEach) {
            return function forEach(fn: Function) {
              actualTarget.forEach(function (_v: Target, k: Prop) {
                fn(
                  proxify(_v, data, handler, {
                    obj: t,
                    link: k,
                  }).proxy
                );
              });
            };
          } else {
            return actualTarget.bind(t);
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
              walkParents(Actions.clear, data, t);
            };
          } else if (p === Methods.values || p === Methods.entries) {
            return function* iterator() {
              const isEntries = p === Methods.entries;
              const values = actualTarget.values();
              let value;
              let proxy;
              let parent;
              for (value of values) {
                parent = {
                  obj: t,
                  link: value,
                };
                proxy = proxify(value, data, handler, parent).proxy;
                yield isEntries ? [proxy, proxy] : proxy;
              }
            };
          } else if (p === Methods.forEach) {
            return function forEach(fn: Function) {
              actualTarget.forEach(function (_v: Target) {
                fn(
                  proxify(_v, data, handler, {
                    obj: t,
                    link: _v,
                  }).proxy
                );
              });
            };
          } else {
            return actualTarget.bind(t);
          }
        }
      } else if (type === Types.Function) {
        return v;
      } else {
        return proxify(v, data, handler, { obj: t, link: p }).proxy;
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

  const result = producer(currData.proxy as UnFreeze<T>, state as Freeze<T>);

  if (typeof result !== "undefined") {
    return original(result) as R;
  } else if (currData.shallow === null) {
    return state as R;
  } else {
    return original(currData.shallow) as R;
  }
}

const self = Symbol();
const actual = Symbol();

export function original<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return obj;
  return (obj as T & { [actual]: T })[actual] || obj;
}

type Data = WeakMap<Target, TargetData>;

type TargetData = {
  proxy: Target;
  shallow: Target | null;
  parents: Set<TargetParent>;
  children: WeakSet<Object>;
};

type TargetParent = {
  obj: Target;
  link: Target | Prop;
};

export function createProxy(
  obj: Target,
  data: Data,
  handler: ProxyHandler<Target>,
  parent?: TargetParent
) {
  let currData: TargetData;
  if (data.has(obj)) {
    currData = data.get(obj) as TargetData;
    if (parent) currData.parents.add(parent);
  } else {
    currData = {
      proxy: new Proxy(obj, handler),
      shallow: null,
      parents: parent ? new Set([parent]) : new Set(),
      children: new WeakSet(),
    };
    data.set(obj, currData);
  }
  return currData;
}

function walkParents(
  action: Actions,
  data: Data,
  t: Target,
  p?: Prop,
  v?: unknown,
  link?: Prop | Target,
  child?: Target
) {
  const currData = data.get(t);
  if (!currData) throw new Error("Missing data from current object");
  let shallow = currData.shallow;
  let type;
  if (shallow === null) {
    type = getTypeString(t);
    shallow = currData.shallow = shallowClone(t, type as Types);
  }
  if (action === Actions.set) {
    (shallow as UnknownObj)[p as Prop] = original(v);
  } else if (action === Actions.delete) {
    delete (shallow as UnknownObj)[p as Prop];
  } else if (action === Actions.set_map) {
    (shallow as UnknownMap).set(p, original(v));
  } else if (action === Actions.delete_map) {
    (shallow as UnknownMap).delete(p);
  } else if (action === Actions.add_set) {
    (shallow as UnknownSet).add(original(v));
  } else if (action === Actions.delete_set) {
    (shallow as UnknownSet).delete(original(v));
  } else if (action === Actions.clear) {
    (shallow as UnknownMap | UnknownSet).clear();
  } else if (action === Actions.append) {
    const children = currData.children;
    child = original(child);
    if (children.has(child as Target)) return;
    children.add(child as Target);
    type = type || getTypeString(t);
    if (type === Types.Map) {
      (shallow as UnknownMap).set(link, child);
    } else if (type === Types.Set) {
      (shallow as UnknownSet).delete(link);
      (shallow as UnknownSet).add(child); // insertion order is not mantained in sets
    } else {
      (shallow as UnknownObj)[link as Prop] = child;
    }
  }
  currData.parents.forEach(function (pa) {
    walkParents(Actions.append, data, pa.obj, p, v, pa.link, shallow as Target);
  });
}

const toString = Object.prototype.toString;

function isPrimitive(x: unknown): x is Primitive {
  if (x === null) return true;
  const type = typeof x;
  if (type !== Types.function && type !== Types.object) return true;
  return false;
}

function getTypeString(x: Object) {
  return toString.call(x);
}

function getTypeCategory(x: Object) {
  if (isPrimitive(x)) return Types.primitive;
  return getTypeString(x);
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
  return (
    (cloneTypes[(type || getTypeCategory(x)) as Types] ||
      cloneTypes[Types.Object]) as Function
  )(x);
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
