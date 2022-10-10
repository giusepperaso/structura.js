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
  // only found in patches:
  append_map,
  append_set,
  producer_return,
}

const Traps_self = Symbol();
const Traps_target = Symbol();

export type Primitive<T> = T extends object ? T : never;
export type Prop = string | number | symbol;
export type UnknownObj = Record<Prop, unknown>;
export type UnknownMap = Map<unknown, unknown>;
export type UnknownSet = Set<unknown>;

export type Producer<T, Q> = (draft: UnFreeze<T>) => Q | void;
export type ProduceOptions = { proxify?: typeof createProxy };
export type ProduceReturn<T, Q> = FreezeOnce<Q extends void ? T : Q>;
export type PatchCallback = (patches: Patch[], inversePatches: Patch[]) => void;

export type FreezeOnce<T> = T extends Freeze<infer Q> ? Freeze<Q> : Freeze<T>;

export type Freeze<T> = T extends Primitive<T>
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

export type UnFreeze<T> = T extends Primitive<T>
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
  patchCallback?: PatchCallback,
  { proxify = createProxy }: ProduceOptions = {}
): ProduceReturn<T, Q> {
  type R = ProduceReturn<T, Q>;
  if (isPrimitive(state)) return producer(state as UnFreeze<T>) as R;
  const data = new WeakMap();
  const pStore: PatchStore | null = patchCallback
    ? { patches: [], inversePatches: [] }
    : null;
  const handler = {
    get(t: object, p: Prop, r: object) {
      if (p === Traps_self) return t;
      const actualTarget = data.get(t)?.shallow || t;
      if (p === Traps_target) return actualTarget;
      const v = Reflect.get(actualTarget, p, r);
      if (isPrimitive(v)) return v;
      const type = getTypeString(t);
      if (type === Types.Map) {
        if (typeof v === Types.function) {
          if (p === Methods.set) {
            return function (k: Prop, x: unknown) {
              if (actualTarget.get(k) !== x)
                walkParents(Actions.set_map, data, pStore, t, k, x);
              return r;
            };
          } else if (p === Methods.delete) {
            return function (k: Prop) {
              const result = actualTarget.has(k);
              if (result) walkParents(Actions.delete_map, data, pStore, t, k);
              return result;
            };
          } else if (p === Methods.clear) {
            return function () {
              walkParents(Actions.clear_map, data, pStore, t);
            };
          } else if (p === Methods.get) {
            return function (k: Prop) {
              const x = actualTarget.get(k);
              return !isPrimitive(x)
                ? proxify(x, data, handler, t, k).proxy
                : x;
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
              actualTarget.forEach(function (x: object, k: Prop) {
                fn(proxify(x, data, handler, t, k).proxy);
              });
            };
          } else {
            return v.bind(proxify(t, data, handler).proxy);
          }
        }
      } else if (type === Types.Set) {
        if (typeof v === Types.function) {
          if (p === Methods.add) {
            return function (x: unknown) {
              if (!actualTarget.has(x))
                walkParents(Actions.add_set, data, pStore, t, undefined, x);
              return r;
            };
          } else if (p === Methods.delete) {
            return function (x: unknown) {
              const result = actualTarget.has(x);
              if (result)
                walkParents(Actions.delete_set, data, pStore, t, undefined, x);
              return result;
            };
          } else if (p === Methods.clear) {
            return function () {
              walkParents(Actions.clear_set, data, pStore, t);
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
              actualTarget.forEach(function (x: object) {
                fn(proxify(x, data, handler, t, x).proxy);
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
    set(t: object, p: Prop, v: unknown, r: object) {
      if (Reflect.get(t, p, r) !== v)
        walkParents(Actions.set, data, pStore, t, p, v);
      return true;
    },
    deleteProperty(t: object, p: Prop) {
      walkParents(Actions.delete, data, pStore, t, p);
      return true;
    },
  };
  const currData = proxify(state as unknown as object, data, handler);
  const result = producer(currData.proxy as UnFreeze<T>);
  const hasReturn = typeof result !== "undefined";
  if (patchCallback && pStore) {
    if (hasReturn) {
      if (!data.has(result as object)) pStore.patches = [];
      pStore.patches.push({ v: result, action: Actions.producer_return });
      pStore.inversePatches.push({ action: Actions.producer_return });
    }
    patchCallback(pStore.patches, pStore.inversePatches);
  }
  if (hasReturn) {
    return target(result) as R;
  } else if (currData.shallow === null) {
    return state as R;
  } else {
    return target(currData.shallow) as R;
  }
}

export function safeProduce<T>(...args: Parameters<typeof produce<T, T>>) {
  return produce<T, T>(...args);
}

export function target<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return obj;
  return (obj as T & { [Traps_target]: T })[Traps_target] || obj;
}

export function original<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return obj;
  return (obj as T & { [Traps_self]: T })[Traps_self] || obj;
}

export type Patch = { v?: unknown; p?: Link; action: Actions; next?: Patch[] };
export type PatchPair = { patch: Patch; inverse: Patch };
export type PatchStore = { patches: Patch[]; inversePatches: Patch[] };

export type Link = Prop | object;
export type LinkMap = Map<Link, PatchPair | null>;
export type ParentMap = Map<object, LinkMap>;

export type Data = WeakMap<object, TargetData>;
export type TargetData = {
  proxy: object;
  shallow: object | null;
  parents: ParentMap;
};

export type CreateProxyArgs = [object, Data, ProxyHandler<object>];
export type CreateProxy =
  | ((...args: [...CreateProxyArgs, object?, Link?]) => TargetData)
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
    if (parent) {
      const parents = currData.parents;
      if (parents.has(parent)) {
        // avoids reusing the same patch twice in subsequent calls; also avoids multiple references problems;
        // however the same patch can be reused on a single call, like in array.push() which also modifies the length,
        // so we can't just store a boolean instead of a patch
        (parents.get(parent) as LinkMap).set(link as Link, null);
      } else {
        parents.set(parent, new Map([[link as Link, null]]));
      }
    }
  } else {
    currData = {
      proxy: new Proxy(obj, handler),
      shallow: null,
      parents: parent
        ? new Map([[parent, new Map([[link, null]])]])
        : new Map(),
    };
    data.set(obj, currData);
  }
  return currData;
};

function walkParents(
  action: Actions,
  data: Data,
  patchStore: PatchStore | null,
  t: object,
  p?: Prop,
  v?: unknown,
  links?: LinkMap,
  prevPatches?: PatchPair[]
) {
  const currPatches: PatchPair[] = [];
  const currData = data.get(t) as TargetData;
  let shallow = currData.shallow;
  let type = "";
  if (shallow === null) {
    type = getTypeString(t);
    shallow = currData.shallow = shallowClone(t, type as Types);
    data.set(shallow, currData);
  }
  function actionLink(inverseAction: Actions, link: Link, v: unknown) {
    let prevChildAtLink = null;
    let thereWasPrevChild = false;
    if (action === Actions.set || action === Actions.delete) {
      prevChildAtLink = (shallow as UnknownObj)[link as Prop];
      thereWasPrevChild = true;
    } else if (
      action === Actions.set_map ||
      action === Actions.delete_map ||
      action === Actions.clear_map
    ) {
      prevChildAtLink = (shallow as UnknownMap).get(link as Prop);
      thereWasPrevChild = true;
    }
    const isAddOperation =
      action === Actions.set ||
      action === Actions.set_map ||
      action === Actions.add_set;
    if (isAddOperation) {
      if (data.has(prevChildAtLink as object)) {
        const prevChildData = data.get(prevChildAtLink as object) as TargetData;
        const parentData = prevChildData.parents.get(t);
        if (parentData) {
          parentData.delete(link);
        }
      }
    }
    if (patchStore) {
      let patchAction = action;
      if (action === Actions.clear_map) patchAction = Actions.delete_map;
      if (action === Actions.clear_set) patchAction = Actions.delete_set;
      currPatches.push({
        patch: { v, p, action: patchAction },
        inverse: {
          v: prevChildAtLink,
          p,
          action: thereWasPrevChild ? patchAction : inverseAction,
        },
      });
    }
    const childData = data.get(v as object);
    if (childData) {
      const childParents = childData.parents;
      if (childParents && childParents.has(t)) {
        const linkMap = childParents.get(t) as LinkMap;
        if (isAddOperation) {
          linkMap.set(link, null);
        } else {
          linkMap.delete(link);
          if (!linkMap.size) childParents.delete(t);
        }
      }
    }
  }
  if (action === Actions.set) {
    const actualValue = target(v);
    actionLink(Actions.delete, p as Prop, actualValue);
    (shallow as UnknownObj)[p as Prop] = actualValue;
  } else if (action === Actions.delete) {
    const actualValue = (shallow as UnknownObj)[p as Prop];
    actionLink(Actions.set, p as Prop, actualValue);
    delete (shallow as UnknownObj)[p as Prop];
  } else if (action === Actions.set_map) {
    const actualValue = target(v);
    actionLink(Actions.delete_map, p as Prop, actualValue);
    (shallow as UnknownMap).set(p, actualValue);
  } else if (action === Actions.delete_map) {
    const actualValue = (shallow as UnknownMap).get(p);
    actionLink(Actions.set_map, p as Prop, actualValue);
    (shallow as UnknownMap).delete(p);
  } else if (action === Actions.clear_map) {
    for (const entry of (shallow as UnknownMap).entries()) {
      actionLink(Actions.set_map, entry[0] as Link, target(entry[1]));
    }
    (shallow as UnknownMap).clear();
  } else if (action === Actions.add_set) {
    const actualValue = target(v) as Link;
    actionLink(Actions.delete_set, actualValue, actualValue);
    (shallow as UnknownSet).add(actualValue);
  } else if (action === Actions.delete_set) {
    const actualValue = target(v) as Link;
    actionLink(Actions.add_set, actualValue, actualValue);
    (shallow as UnknownSet).delete(actualValue);
  } else if (action === Actions.clear_set) {
    for (const value of (shallow as UnknownSet).values()) {
      const actualValue = target(value) as Link;
      actionLink(Actions.add_set, actualValue, actualValue);
    }
    (shallow as UnknownSet).clear();
  } else if (action === Actions.append) {
    if (links) {
      type = type || getTypeString(t);
      let someTraversed = false;
      function actionAppend(
        links: LinkMap,
        link: Link,
        traversedPatches: PatchPair | null,
        patchAction: Actions
      ) {
        let thisTraversed = false;
        if (!traversedPatches) {
          someTraversed = true;
          thisTraversed = true;
          if (patchStore) {
            traversedPatches = {
              patch: { p: link, action: patchAction, next: [] },
              inverse: { p: link, action: patchAction, next: [] },
            };
          } else {
            traversedPatches = dummyPatches;
          }
          links.set(link, traversedPatches);
        }
        if (patchStore) {
          currPatches.push(traversedPatches);
          for (let i = 0; i !== (prevPatches as PatchPair[]).length; i++) {
            const prevPatch = (prevPatches as PatchPair[])[i];
            (traversedPatches.patch.next as Patch[]).push(prevPatch.patch);
            (traversedPatches.inverse.next as Patch[]).push(prevPatch.inverse);
          }
        }
        return thisTraversed;
      }
      if (type === Types.Map) {
        for (const [link, traversedPatches] of links.entries()) {
          if (actionAppend(links, link, traversedPatches, Actions.append_map)) {
            (shallow as UnknownMap).set(link, v);
          }
        }
      } else if (type === Types.Set) {
        for (const [link, traversedPatches] of links.entries()) {
          if (actionAppend(links, link, traversedPatches, Actions.append_set)) {
            // order in sets is not preserved;
            // preserving the order would be too costly and does not matter
            (shallow as UnknownSet).delete(link);
            (shallow as UnknownSet).add(v);
          }
        }
      } else {
        for (let [link, traversedPatches] of links.entries()) {
          if (actionAppend(links, link, traversedPatches, Actions.append)) {
            (shallow as UnknownObj)[link as Prop] = v;
          }
        }
      }
      if (!someTraversed) return;
    }
  }
  const currParents = currData.parents;
  if (currParents.size) {
    for (const [parent, links] of currParents.entries()) {
      walkParents(
        Actions.append,
        data,
        patchStore,
        parent,
        undefined,
        shallow,
        links,
        currPatches
      );
    }
  } else {
    if (patchStore) {
      for (let i = 0; i != currPatches.length; i++) {
        patchStore.patches.push(currPatches[i].patch);
        patchStore.inversePatches.push(currPatches[i].inverse);
      }
    }
  }
}

const dummyPatches = {
  patch: { action: Actions.set },
  inverse: { action: Actions.set },
};

export function applyPatches(patches: Patch[]) {
  for (let i = 0; i !== patches.length; i++) {
    applyPatch(patches[i]);
  }
}

export function applyPatch(patch: Patch) {
  // consumo patches: parto da patches poi per ognuna => for n of next
  patch;
}

function isPrimitive<T>(x: unknown): x is Primitive<T> {
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

function shallowClone(x: unknown, type?: Types): object {
  return (cloneTypes[type || Types.Object] as Function)(x);
}

const cloneTypes: Partial<Record<Types, Function>> = {
  [Types.primitive]<T>(x: Primitive<T>) {
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
