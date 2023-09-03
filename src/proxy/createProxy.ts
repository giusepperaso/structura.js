import type { PatchPair } from "../core/patches";
import type { Prop } from "../helpers/types";
import { Types, toStringType } from "../helpers/types";

export type AllData = WeakMap<object, ItemData>;
export type ItemData = {
  proxy: object;
  type: string;
  original: object;
  shallow: object | null;
  parents: ParentMap;
  inverseLength?: number;
  modified: boolean;
};

export type Link = Prop | object;
export type LinkMap = Map<Link, PatchPair | null | true>;
export type ParentMap = Map<object, LinkMap>;

export const createProxy = function (
  obj: object,
  data: AllData,
  handler: ProxyHandler<object>,
  parent?: object,
  link?: Link
): ItemData {
  let itemData: ItemData;
  if (data.has(obj)) {
    itemData = data.get(obj) as ItemData;
    if (parent) {
      const parents = itemData.parents;
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
    itemData = {
      original: obj,
      type: toStringType(obj),
      shallow: null,
      modified: false,
      parents: parent
        ? new Map([[parent, new Map([[link, null]])]])
        : new Map(),
    } as ItemData;

    const wrap = itemData.type === Types.Array ? [itemData] : { 0: itemData };
    
    itemData.proxy = new Proxy(wrap, handler);
    data.set(obj, itemData);
  }
  return itemData;
};
