enum Types {
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

enum Methods {
  get = "get",
  set = "set",
  add = "add",
  delete = "delete",
  clear = "clear",
  values = "values",
  entries = "entries",
  forEach = "forEach",
}

enum Actions {
  set,
  set_map,
  add_set,
  delete,
  delete_map,
  delete_set,
  clear,
  append,
}

type Target =
  | String
  | Number
  | Boolean
  | Date
  | RegExp
  | Object
  | UnknownArray
  | UnknownMap
  | UnknownSet;

type NonEmptyPrimitive = string | number | boolean | symbol;
type Primitive = null | undefined | NonEmptyPrimitive;

type Prop = string | number | symbol;

type UnknownObj = Record<Prop, unknown>;
type UnknownMap = Map<unknown, unknown>;
type UnknownSet = Set<unknown>;
type UnknownArray = Array<unknown>;

type Producer<T, Q = T> = (state: T, original: T) => Q | void;

type Options = { proxify?: typeof createProxy };

export function produce<T, Q = T, R = Q extends void ? T : Q>(
  state: T,
  producer: Producer<T, Q>,
  { proxify = createProxy }: Options = {}
): R {
  if (isPrimitive(state)) return producer(state, state) as unknown as R;
  const data = new WeakMap();
  const handler = {
    get(t: Target, p: Prop, r: Target) {
      const actualTarget = data.get(t)?.shallow || t;
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

  const result = producer(currData.proxy as T, state);

  if (typeof result !== "undefined") {
    return result as unknown as R;
  } else if (currData.shallow === null) {
    return state as unknown as R;
  } else {
    return currData.shallow as unknown as R;
  }
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
    (shallow as UnknownObj)[p as Prop] = v;
  } else if (action === Actions.delete) {
    delete (shallow as UnknownObj)[p as Prop];
  } else if (action === Actions.set_map) {
    (shallow as UnknownMap).set(p, v);
  } else if (action === Actions.delete_map) {
    (shallow as UnknownMap).delete(p);
  } else if (action === Actions.add_set) {
    (shallow as UnknownSet).add(v);
  } else if (action === Actions.delete_set) {
    (shallow as UnknownSet).delete(v);
  } else if (action === Actions.clear) {
    (shallow as UnknownMap | UnknownSet).clear();
  } else if (action === Actions.append) {
    const children = currData.children;
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

function isPrimitive(x: unknown) {
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

/* 
Cosa succede se prendo un oggetto senza settare nulla, poi lo setto in un'altra riga e poi lo setto dopo dalla prima?

error handling oggetti non supportati (in realtà forse basterebbe su function) oppure type checking statico

IMMEr consente solo return oppure modifica draft, mai insieme; supportare questo use case

patches come in immer, opzionale

object freeze come in immer, ma opzionale

supportare una api simile ad immer

conserva il tipo per un lookup veloce
*/
