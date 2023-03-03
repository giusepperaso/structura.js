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
  no_op,
}

const Settings = {
  strictCopy: false,
};

const Traps_self = Symbol();
const Traps_target = Symbol();
const Traps_data = Symbol();

export type Primitive = null | undefined | boolean | number | string | symbol;
export type Prop = number | string | symbol;
export type UnknownObj = Record<Prop, unknown>;
export type UnknownArr = Array<unknown>;
export type UnknownMap = Map<unknown, unknown>;
export type UnknownSet = Set<unknown>;

export type Producer<T, Q> = (draft: UnFreeze<T>) => Q | void | UnFreeze<T>;

export type ProduceOptions = { proxify?: typeof createProxy };

export type ProduceReturn<T, Q> = FreezeOnce<Q extends void ? T : Q>;

export type PatchCallback<T> = T extends Primitive
  ? never
  : (patches: Patch[], inversePatches: Patch[]) => void;

export type FreezeOnce<T> = T &
  (T extends Freeze<infer Q> ? Freeze<Q> : Freeze<T>);

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
  : T extends object
  ? UnFreezedObject<T>
  : T;

export type UnFreezedObject<T> = { -readonly [K in keyof T]: UnFreeze<T[K]> };

export function produce<T, Q>(
  state: T,
  producer: Producer<T, Q>,
  patchCallback?: PatchCallback<T>,
  { proxify = createProxy }: ProduceOptions = {}
): ProduceReturn<T, Q> {
  type R = ProduceReturn<T, Q>;
  if (!isDraftable(state)) {
    const result = producer(state as UnFreeze<T>) as R;
    if (patchCallback) {
      const op = Actions.producer_return;
      patchCallback([{ v: result, op }], [{ v: state, op }]);
    }
    return result;
  }
  const data = new WeakMap();
  const freezeReplaceTargets = new WeakMap();
  const pStore: PatchStore | null = patchCallback
    ? { patches: [], inversePatches: [] }
    : null;
  const handler = {
    get(t: object, p: Prop, r: object) {
      if (p === Traps_data) return data;
      if (p === Traps_self) return t;
      const currData = data.get(t);
      const actualTarget = (currData && currData.shallow) || t;
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
        const currData = proxify(t, data, handler);
        if (type === Types.Array) {
          currData.inverseLength = (t as UnknownArr).length;
        }
        return v.bind(currData.proxy);
      } else if (Object.isFrozen(v)) {
        // getOwnPropertyDescriptor trap doesn't allow to return
        // descriptors different from the target,
        // so we can't proxy frozen objects, because we couldn't write their props;
        // we create instead a "dummy" target that we could reuse
        const newTarget = shallowClone(v);
        freezeReplaceTargets.set(v, newTarget);
        return proxify(newTarget, data, handler, t, p).proxy;
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
    has(t: object, p: Prop) {
      if (p === Traps_self || p === Traps_target || p === Traps_data)
        return true;
      const currData = data.get(t);
      const actualTarget = (currData && currData.shallow) || t;
      return p in actualTarget;
    },
    ownKeys(t: object) {
      const currData = data.get(t);
      const actualTarget = (currData && currData.shallow) || t;
      return Reflect.ownKeys(actualTarget);
    },
    getOwnPropertyDescriptor(t: object, p: Prop) {
      const currData = data.get(t);
      const actualTarget = (currData && currData.shallow) || t;
      const descriptor = Object.getOwnPropertyDescriptor(actualTarget, p);
      if (!descriptor) return undefined;
      const d = {
        writable: descriptor.writable,
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        value: actualTarget[p],
      };
      return d;
    },
  };
  const currData = proxify(state as unknown as object, data, handler);
  const result = producer(currData.proxy as UnFreeze<T>);
  let shallow = currData.shallow;
  const produced = shallow === null ? state : shallow;
  const hasReturn = typeof result !== "undefined";
  if (patchCallback && pStore) {
    if (hasReturn) {
      if (!data.has(result as object)) pStore.patches = [];
      const op = Actions.producer_return;
      pStore.patches.push({ v: result, op });
      pStore.inversePatches.push({ v: produced, op });
    }
    patchCallback(pStore.patches, pStore.inversePatches.reverse());
  }
  if (hasReturn) {
    return target(result) as R;
  } else {
    return produced as R;
  }
}

export function produceWithPatches<T, Q>(...args: [T, Producer<T, Q>]) {
  let patches: Patch[];
  let inverse: Patch[];
  function setPatches(_patches: Patch[], _inverse: Patch[]) {
    patches = _patches;
    inverse = _inverse;
  }
  const result = produce(...args, setPatches as PatchCallback<T>);
  return [result, patches!, inverse!] as const;
}

export function produceWithStandardPatches<T, Q>(
  ...args: Parameters<typeof produceWithPatches<T, Q>>
) {
  const [result, patches, reverse] = produceWithPatches(...args);
  return [
    result,
    convertPatchesToStandard(patches),
    convertPatchesToStandard(reverse),
  ];
}

export function safeProduce<T>(...args: Parameters<typeof produce<T, T>>) {
  return produce<T, T>(...args);
}

export function safeProduceWithPatches<T>(
  ...args: Parameters<typeof produceWithPatches<T, T>>
) {
  return produceWithPatches<T, T>(...args);
}

export function safeProduceWithStandardPatches<T>(
  ...args: Parameters<typeof produceWithStandardPatches<T, T>>
) {
  return produceWithStandardPatches<T, T>(...args);
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
  if (typeof obj === "undefined" || obj === null) return;
  return (obj as T & { [Traps_data]: WeakMap<object, TargetData> })[Traps_data];
}

export function snapshot<T>(obj: T): T {
  if (!isDraft(obj)) return obj;
  function deep<Q>(v: unknown, k: unknown, clone: Q) {
    if (clone !== null && typeof clone === "object") {
      const typeString = getTypeString(clone);
      const child = cloneOrOriginal(v as object);
      if (typeString === Types.Map) {
        (clone as unknown as UnknownMap).set(k, child);
      } else if (typeString === Types.Set) {
        (clone as unknown as UnknownSet).add(child);
      } else {
        (clone as UnknownObj)[k as Prop] = child;
      }
    }
  }
  // if it already has a clone then clone it again,
  // else return the original
  function cloneOrOriginal(t: object) {
    const _target = target(t);
    return _target !== original(t)
      ? (shallowClone(_target, undefined, deep) as T)
      : (_target as T);
  }
  return cloneOrOriginal(obj as object);
}

export function freeze<T>(
  obj: T,
  runtime: boolean = false,
  deep: boolean = false
): T {
  if (runtime && !Object.isFrozen(obj) && !isDraft(obj) && isDraftable(obj)) {
    const err = () => {
      throw Error("This object has been frozen and should not be mutated");
    };
    switch (getTypeString(obj)) {
      case Types.Map:
        const map = obj as UnknownMap;
        map.set = map.clear = map.delete = err;
        if (deep) {
          map.forEach((v, k) => {
            freeze(k, true, true);
            freeze(v, true, true);
          });
        }
        break;
      case Types.Set:
        const set = obj as UnknownSet;
        set.add = set.clear = set.delete = err;
        if (deep) set.forEach((v) => freeze(v, true, true));
        break;
      default:
        if (deep) {
          const keys = Reflect.ownKeys(obj as object);
          for (let i = 0; i !== keys.length; i++) {
            freeze(obj[keys[i] as keyof T], true, true);
          }
        }
    }
    Object.freeze(obj);
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

export function isDraft<T>(obj: T) {
  return !isPrimitive(obj) && Traps_self in (obj as object);
}

export function isDraftable(obj: unknown) {
  return !isPrimitive(obj);
}

export type Patch = {
  v?: unknown;
  p?: Link;
  op: Actions | JSONPatch["op"]; // allow manual push of json patches
  next?: Patch[];
  path?: unknown[] | string; // allow manual push of json patches
  value?: unknown; // allow manual push of json patches
};

export type JSONPatch = {
  op: "add" | "replace" | "remove";
  path: unknown[] | string;
  value?: unknown;
};

export type PatchPair = { patch: Patch; inverse: Patch };
export type PatchStore = { patches: Patch[]; inversePatches: Patch[] };

export type Link = Prop | object;
export type LinkMap = Map<Link, PatchPair | null | true>;
export type ParentMap = Map<object, LinkMap>;

export type Data = WeakMap<object, TargetData>;
export type TargetData = {
  proxy: object;
  shallow: object | null;
  parents: ParentMap;
  inverseLength?: number;
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
        // the parents reference is useful in two ways:
        // avoids reusing the same patch twice in subsequent calls and also avoids multiple references problems;
        // the initial idea was to store a boolean, but we can't do it because the same patch can be reused on a single call,
        // like in array.push() which also modifies the length
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
  // don't use p directly but use link because p may be different or undefined
  function actionLink(inverseAction: Actions, link: Link, v: unknown) {
    let prevChildAtLink = null;
    if (action === Actions.set) {
      if (link === "length" && typeof currData.inverseLength !== "undefined") {
        prevChildAtLink = currData.inverseLength;
        delete currData.inverseLength; // is this really necessary?
      } else {
        prevChildAtLink = (shallow as UnknownObj)[link as Prop];
      }
    } else if (action === Actions.delete) {
      prevChildAtLink = (shallow as UnknownObj)[link as Prop];
    } else if (
      action === Actions.set_map ||
      action === Actions.delete_map ||
      action === Actions.clear_map
    ) {
      prevChildAtLink = (shallow as UnknownMap).get(link as Prop);
    } else if (
      action === Actions.add_set ||
      action === Actions.delete_set ||
      action === Actions.clear_set
    ) {
      prevChildAtLink = link;
    }
    if (
      action === Actions.set ||
      action === Actions.set_map /* ||
      action === Actions.add_set */
    ) {
      if (typeof prevChildAtLink !== "undefined") inverseAction = action;
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
        patch: { v, p: link, op: patchAction },
        inverse: {
          v: prevChildAtLink,
          p: link,
          op: inverseAction,
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
        traversedPatches: PatchPair | null | true,
        patchAction: Actions
      ) {
        let thisTraversed = false;
        if (!traversedPatches) {
          someTraversed = true;
          thisTraversed = true;
          if (patchStore) {
            traversedPatches = {
              patch: { p: link, op: patchAction, next: [] },
              inverse: {
                p: link,
                op: patchAction,
                next: [],
              },
            };
          } else {
            traversedPatches = true;
          }
          links.set(link, traversedPatches);
        }
        if (patchStore) {
          currPatches.push(traversedPatches as PatchPair);
          if (patchAction === Actions.append_set) {
            currPatches.push({
              patch: { op: Actions.no_op },
              inverse: { p: v as Link, op: Actions.delete_set },
            });
          }
          for (let i = 0; i !== (prevPatches as PatchPair[]).length; i++) {
            const prevPatch = (prevPatches as PatchPair[])[i];
            ((traversedPatches as PatchPair).patch.next as Patch[]).push(
              prevPatch.patch
            );
            ((traversedPatches as PatchPair).inverse.next as Patch[]).push(
              prevPatch.inverse
            );
          }
          ((traversedPatches as PatchPair).inverse.next as Patch[]).reverse();
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
            // order in sets is not preserved, because preserving it would be too costly;
            // however in general, you should never rely on sets order in javascript
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

export function applyPatches<T>(
  state: T,
  patches: Patch[] | JSONPatch[]
): UnFreeze<T> {
  let newState: T | object = shallowClone(state) as T;
  let producerReturn;
  const clones: WeakMap<object, object> = new WeakMap();
  if (!isPrimitive(state)) {
    clones.set(state as object, newState as object);
    clones.set(newState as object, newState as object);
  }
  for (let i = 0; i !== patches.length; i++) {
    producerReturn = applyPatch(newState, patches[i], clones);
    if (typeof producerReturn !== "undefined")
      newState = producerReturn as object;
  }
  return newState as UnFreeze<T>;
}

export function applyPatch<T>(
  current: T,
  patch: Patch | JSONPatch,
  clones: WeakMap<object, object>
) {
  if (!patch) return;
  const action = patch.op;
  let childShallow, child, next;
  switch (action) {
    case Actions.set:
      (current as UnknownObj)[patch.p as Prop] = patch.v;
      break;
    case Actions.set_map:
      (current as UnknownMap).set(patch.p, patch.v);
      break;
    case Actions.add_set:
      (current as UnknownSet).add(patch.v);
      break;
    case Actions.delete:
      delete (current as UnknownObj)[patch.p as Prop];
      break;
    case Actions.delete_map:
    case Actions.delete_set:
      (current as UnknownMap | UnknownSet).delete(patch.p);
      break;
    case Actions.clear_map:
    case Actions.clear_set:
      (current as UnknownMap | UnknownSet).clear();
      break;
    case Actions.append:
    case Actions.append_map:
    case Actions.append_set:
      if (action === Actions.append_map) {
        child = (current as UnknownMap).get(patch.p as Prop) as object;
      } else if (action === Actions.append_set) {
        child = patch.p as object;
      } else {
        child = (current as UnknownObj)[patch.p as Prop] as object;
      }
      if (!clones.has(child)) {
        childShallow = shallowClone(child);
        clones.set(child, childShallow);
        clones.set(childShallow, childShallow);
      } else {
        childShallow = clones.get(child);
      }
      if (action === Actions.append_map) {
        (current as UnknownMap).set(patch.p as Link, childShallow);
      } else if (action === Actions.append_set) {
        if (child !== childShallow) {
          (current as UnknownSet).delete(child);
          (current as UnknownSet).add(childShallow);
        }
      } else {
        (current as UnknownObj)[patch.p as Prop] = childShallow;
      }
      next = patch.next;
      if (next) {
        for (let i = 0; i !== next.length; i++) {
          applyPatch(childShallow as object, next[i], clones);
        }
      }
      break;
    case Actions.producer_return:
      return patch.v;
    /* ------------- JSON Patch RFC compatibility ------------- */
    case "add":
    case "replace":
    case "remove":
      // if path is not an array, let's split it; also remove non truish portions
      const p = patch.path as JSONPatch["path"];
      const pathList = (Array.isArray(p) ? p : p.split("/")).filter(
        (p) => !!p || p === 0 // can't use "" as index in string version
      );
      // if the path is empty, just return the value
      if (!pathList.length) {
        return (patch as JSONPatch & { op: "replace" }).value;
      }
      // helper to get the clone if it's already here or create it
      function getClone(objAtKey: unknown) {
        if (isPrimitive(objAtKey)) return objAtKey;
        if (!clones.has(objAtKey as object)) {
          const child = shallowClone(objAtKey);
          clones.set(objAtKey as object, child);
          clones.set(child, child);
          return child;
        }
        return clones.get(objAtKey as object);
      }
      // we loop through the porions of the path, each time getting the new curr
      let curr: unknown = current;
      pathList.forEach((key: unknown, index) => {
        const isLast = index === pathList.length - 1;
        if (!isLast) {
          // if it's not the last portion of the path, we just replace the child with a shallow clone
          let clone: T;
          switch (getTypeString(curr)) {
            case Types.Map:
              clone = getClone((curr as UnknownMap).get(key)) as T;
              (curr as UnknownMap).set(key, clone);
              break;
            case Types.Set:
              clone = getClone(key) as T;
              (curr as UnknownSet).delete(key);
              (curr as UnknownSet).add(clone);
              break;
            default:
              clone = getClone((curr as UnknownObj)[key as Prop]) as T;
              (curr as UnknownObj)[key as Prop] = clone;
          }
          curr = clone;
        } else {
          // if it's the last element, we do the action in "op"
          switch (getTypeString(curr)) {
            case Types.Map:
              if (action === "remove") (curr as UnknownMap).delete(key);
              else (curr as UnknownMap).set(key, patch.value);
              break;
            case Types.Set:
              if (action === "remove") (curr as UnknownSet).delete(key);
              else (curr as UnknownSet).add(key);
              break;
            default:
              if (action === "remove") delete (curr as UnknownObj)[key as Prop];
              else (curr as UnknownObj)[key as Prop] = patch.value;
          }
        }
      });
      break;
  }
}

export function convertPatchesToStandard(
  patches: Patch[],
  pathArray: boolean = true,
  path: unknown[] = [], // don't pass manually as argument
  converted: JSONPatch[] = [] // don't pass manually as argument
): JSONPatch[] {
  let i = 0,
    l = patches.length;
  for (; i !== l; i++) {
    const patch = patches[i];
    const action = patch.op;
    if (action === Actions.no_op) continue;
    const newPath = "p" in patch ? [...path, patch.p] : path;
    const isAppendOp =
      action === Actions.append ||
      action === Actions.append_map ||
      action === Actions.append_set;
    if (!isAppendOp) {
      const isDeleteOp =
        action === Actions.delete ||
        action === Actions.delete_map ||
        action === Actions.delete_set;
      converted.push({
        op: isDeleteOp ? "remove" : "replace",
        path: pathArray ? newPath : "/" + newPath.join("/"), // can't use "" as index in string version
        value: patch.v,
      });
    }
    const next = patch.next;
    if (next) convertPatchesToStandard(next, pathArray, newPath, converted);
  }
  return converted;
}

export function isPrimitive(x: unknown): x is Primitive {
  if (x === null) return true;
  const type = typeof x;
  if (type !== Types.function && type !== Types.object) return true;
  return false;
}

const toString = Object.prototype.toString;

function getTypeString<T>(x: T) {
  return toString.call(x);
}

function getType<T>(x: T) {
  return isPrimitive(x)
    ? "primitive"
    : typeof x === "function"
    ? "function"
    : toString.call(x);
}

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

export const enableStrictCopy = (v = true) => (Settings.strictCopy = v);

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

function shallowClone<T>(x: T, type?: Types, forEach?: ForEach): object {
  const fn = cloneFns[type || (getType(x) as Types)] || cloneFns[Types.Object];
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
