//@ts-nocheck
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

export function produce(state, producer) {
  if (isPrimitive(state)) return producer(state, state);
  const data = new WeakMap();
  const handler = {
    get(t, p, r) {
      const actualTarget = data.get(t)?.shallow || t;
      const v = Reflect.get(actualTarget, p, r);
      if (isPrimitive(v)) return v;
      const type = getTypeString(t);
      if (type === Types.Map) {
        if (typeof v === Types.function) {
          if (p === Methods.set) {
            return function (k, _v) {
              if (actualTarget.get(k) !== _v)
                walkParents(Actions.set_map, data, t, k, _v);
              return r;
            };
          } else if (p === Methods.delete) {
            return function (k) {
              const result = actualTarget.has(k);
              if (result) walkParents(Actions.delete_map, data, t, k);
              return result;
            };
          } else if (p === Methods.clear) {
            return function () {
              walkParents(Actions.clear, data, t);
            };
          } else if (p === Methods.get) {
            return function (k) {
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
            return function forEach(fn) {
              actualTarget.forEach(function (v, k) {
                fn(
                  proxify(v, data, handler, {
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
            return function (_v) {
              if (!actualTarget.has(_v))
                walkParents(Actions.add_set, data, t, null, _v);
              return r;
            };
          } else if (p === Methods.delete) {
            return function (_v) {
              const result = actualTarget.has(_v);
              if (result) walkParents(Actions.delete_set, data, t, null, _v);
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
              const parent = {
                obj: t,
              };
              let value;
              let proxy;
              for (value of values) {
                proxy = proxify(value, data, handler, parent, type).proxy;
                yield isEntries ? [proxy, proxy] : proxy;
              }
            };
          } else if (p === Methods.forEach) {
            return function forEach(fn) {
              actualTarget.forEach(function (v) {
                fn(
                  proxify(v, data, handler, {
                    obj: t,
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
    set(t, p, v, r) {
      if (Reflect.get(t, p, r) !== v) walkParents(Actions.set, data, t, p, v);
      return true;
    },
    deleteProperty(t, p) {
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

  const currData = proxify(state, data, handler);
  producer(currData.proxy, state);
  return currData.shallow === null ? state : currData.shallow;
}

function proxify(obj, data, handler, parent) {
  let currData;
  if (data.has(obj)) {
    currData = data.get(obj);
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

function walkParents(action, data, t, p, v, curr = t, link, child) {
  const currData = data.get(curr);
  let shallow = currData.shallow;
  let type;
  if (shallow === null) {
    type = getTypeString(curr);
    shallow = currData.shallow = shallowClone(curr, type);
  }
  if (action === Actions.set) {
    shallow[p] = v;
  } else if (action === Actions.delete) {
    delete shallow[p];
  } else if (action === Actions.set_map) {
    shallow.set(p, v);
  } else if (action === Actions.delete_map) {
    shallow.delete(p);
  } else if (action === Actions.add_set) {
    shallow.add(v);
  } else if (action === Actions.delete_set) {
    shallow.delete(v);
  } else if (action === Actions.clear) {
    shallow.clear();
  } else if (action === Actions.append) {
    const children = currData.children;
    if (children.has(child)) return;
    children.add(child);
    type = type || getTypeString(curr);
    if (type === Types.Map) {
      shallow.set(link, child);
    } else if (type === Types.Set) {
      shallow.add(child);
    } else {
      shallow[link] = child;
    }
  }
  currData.parents.forEach(function (pa) {
    walkParents(Actions.append, data, null, p, v, pa.obj, pa.link, shallow);
  });
}

const toString = Object.prototype.toString;

function isPrimitive(x) {
  if (x === null) return true;
  const type = typeof x;
  if (type !== Types.function && type !== Types.object) return true;
  return false;
}

function getTypeString(x) {
  return toString.call(x);
}

function getTypeCategory(x) {
  if (isPrimitive(x)) return Types.primitive;
  return getTypeString(x);
}

function copyProps(from, to) {
  const keys = Object.keys(from);
  const l = keys.length;
  let i = 0;
  let key;
  for (; i < l; i++) {
    key = keys[i];
    to[key] = from[key];
  }
  // aggiunge hoverhead anche quando non utilizzato, si potrebbe disattivare con impostazione globale
  const symbols = Object.getOwnPropertySymbols(from);
  for (key of symbols) {
    to[key] = from[key];
  }
  return to;
}

function shallowClone(x, type) {
  return (cloneTypes[type || getTypeCategory(x)] || cloneTypes.Object)(x);
}

const cloneTypes = {
  [Types.primitive](x) {
    return x;
  },
  [Types.Object](x) {
    return copyProps(x, Object.create(Object.getPrototypeOf(x)));
  },
  [Types.Array](x) {
    return x.slice(0);
  },
  [Types.String](x) {
    return copyProps(x, new String(x.toString()));
  },
  [Types.Boolean](x) {
    return copyProps(x, new Boolean(!!x));
  },
  [Types.Number](x) {
    return copyProps(x, new Number(x + 0));
  },
  [Types.Date](x) {
    return copyProps(x, new Date(+x));
  },
  [Types.RegExp](x) {
    return copyProps(x, new RegExp(x.source, x.flags));
  },
  [Types.Map](x) {
    const shallow = new Map();
    x.forEach(function (item, key) {
      shallow.set(key, item);
    });
    return shallow;
  },
  [Types.Set](x) {
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
*/
