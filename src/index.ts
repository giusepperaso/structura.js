//ats-nocheck
// ATTENZIONE: se l'oggetto è innestato in diversi punti, solo il parent attraverso cui si è entrati ottiene la modifica
// sarebbe risolvibile ma solo facendo un ciclo su tutto l'oggetto
// https://github.com/immerjs/immer/issues/374

enum Types {
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
  /* | AnyObj */
  | AnyArray
  | AnyMap
  | AnySet;

type NonEmptyPrimitive = string | number | boolean | symbol;
type Primitive = null | undefined | NonEmptyPrimitive;

type Prop = string | number | symbol;

type AnyObj = Record<Prop, unknown>;
type AnyMap = Map<unknown, unknown>;
type AnySet = Set<unknown>;
type AnyArray = Array<unknown>;

type Producer = /* <T extends Target | Primitive> */ (
  state: Target | Primitive,
  original: Target | Primitive
) => Target | Primitive | void;

export function produce(state: Target | Primitive, producer: Producer) {
  if (isPrimitive(state)) return producer(state, state);
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
    /* 
    TODO:
     - defineProperty
     - setPrototypeOF
     - preventExtensions
     - apply?
    */
  };

  const currData = proxify(state as Target, data, handler);
  producer(currData.proxy, state);
  return currData.shallow === null ? state : currData.shallow;
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

function proxify(
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
    (shallow as AnyObj)[p as Prop] = v;
  } else if (action === Actions.delete) {
    delete (shallow as AnyObj)[p as Prop];
  } else if (action === Actions.set_map) {
    (shallow as AnyMap).set(p, v);
  } else if (action === Actions.delete_map) {
    (shallow as AnyMap).delete(p);
  } else if (action === Actions.add_set) {
    (shallow as AnySet).add(v);
  } else if (action === Actions.delete_set) {
    (shallow as AnySet).delete(v);
  } else if (action === Actions.clear) {
    (shallow as AnyMap | AnySet).clear();
  } else if (action === Actions.append) {
    const children = currData.children;
    if (children.has(child as Target)) return;
    children.add(child as Target);
    type = type || getTypeString(t);
    if (type === Types.Map) {
      (shallow as AnyMap).set(link, child);
    } else if (type === Types.Set) {
      (shallow as AnySet).delete(link);
      (shallow as AnySet).add(child); // insertion order is not mantained in sets
    } else {
      (shallow as AnyObj)[link as Prop] = child;
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
    (to as AnyObj)[key] = (from as AnyObj)[key];
  }
  // aggiunge hoverhead anche quando non utilizzato, si potrebbe disattivare con impostazione globale
  const symbols = Object.getOwnPropertySymbols(from);
  for (key of symbols) {
    (to as AnyObj)[key] = (from as AnyObj)[key];
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
  [Types.Map](x: AnyMap) {
    const shallow = new Map();
    x.forEach(function (item, key) {
      shallow.set(key, item);
    });
    return shallow;
  },
  [Types.Set](x: AnySet) {
    const shallow = new Set();
    x.forEach(function (item) {
      shallow.add(item);
    });
    return shallow;
  },
  /* 
    TODO:
     - TypedArray
     - DataView?
     - File?
     - Blob?
     - FileList?
     - DomExceotio
  */
};

/* 
Cosa succede se prendo un oggetto senza settare nulla, poi lo setto in un'altra riga e poi lo setto dopo dalla prima?

Non è che se chiamo push o altri metodi, a questa funzione fa lo shallow clone?

error handling oggetti non supportati (in realtà forse basterebbe su function) oppure type checking statico

IMMEr consente solo return oppure modifica draft, mai insieme; supportare questo use case

patches come in immer, opzionale

object freeze come in immer, ma opzionale

supportare una api simile ad immer

conserva il tipo per un lookup veloce
*/
