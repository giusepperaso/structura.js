import { shallowClone } from "./copy";
import { AllData, ItemData, Link, LinkMap } from "../proxy/createProxy";
import { target } from "../helpers/traps";
import { Patch, PatchPair, PatchStore } from "../core/patches";
import {
  Prop,
  Types,
  UnknownMap,
  UnknownObj,
  UnknownSet,
} from "../helpers/types";

export const enum Actions {
  set,
  set_map,
  add_set,
  delete,
  delete_map,
  delete_set,
  clear_map,
  clear_set,
  set_date,
  append,
  // only found in patches:
  append_map,
  append_set,
  producer_return,
  no_op,
}

export function walkParents(
  mainState: unknown,
  action: Actions,
  data: AllData,
  patchStore: PatchStore | null,
  t: object,
  p?: Prop,
  v?: unknown,
  links?: LinkMap,
  prevPatches?: PatchPair[]
) {
  const currPatches: PatchPair[] = [];
  const itemData = data.get(t) as ItemData;
  let shallow = itemData.shallow;
  const type = itemData.type;
  if (!itemData.modified) {
    itemData.modified = true;
    if (shallow === null) {
      shallow = itemData.shallow = shallowClone(t, type as Types);
    }
  }

  // don't use p directly but use link because p may be different or undefined
  function actionLink(inverseAction: Actions, link: Link, v: unknown) {
    let prevChildAtLink = null;
    if (action === Actions.set) {
      if (link === "length" && typeof itemData.inverseLength !== "undefined") {
        prevChildAtLink = itemData.inverseLength;
        delete itemData.inverseLength; // is this really necessary?
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
    } else if (action === Actions.set_date) {
      // the value is the previous date in this case
      prevChildAtLink = v;
    }
    if (action === Actions.set || action === Actions.set_map) {
      if (typeof prevChildAtLink !== "undefined") inverseAction = action;
    }
    const isAddOperation =
      action === Actions.set ||
      action === Actions.set_map ||
      action === Actions.add_set;
    if (isAddOperation) {
      if (data.has(prevChildAtLink as object)) {
        const prevChildData = data.get(prevChildAtLink as object) as ItemData;
        const parentData = prevChildData.parents.get(t);
        if (parentData) {
          parentData.delete(link);
        }
      }
    }
    if (patchStore) {
      let patchValue = v;
      let patchAction = action;

      if (action === Actions.clear_map) {
        // clear does not exist as a patch action because it would be redudant,
        // infact we can use delete instead
        patchAction = Actions.delete_map;
      } else if (action === Actions.clear_set) {
        // same above
        patchAction = Actions.delete_set;
      } else if (action === Actions.set_date) {
        // for dates we need to extract the value from timestamp
        patchValue = (shallow as Date).getTime();
      }

      currPatches.push({
        patch: { v: patchValue, p: link, op: patchAction },
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
          // those lines are probably unreachable because maybe childParents.has(t) is always false
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
  } else if (action === Actions.set_date) {
    // before creating patches, we need the old time and the new time
    const prevTime = (shallow as Date).getTime();
    ((shallow as Date)[p as keyof Date] as Function)(...(v as unknown[]));
    // only after we can execute action link and create patches
    actionLink(Actions.set_date, p as Link, prevTime);
  } else if (action === Actions.append) {
    if (links) {
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
  const currParents = itemData.parents;
  const hasParents = !!currParents.size;
  if (hasParents) {
    for (const [parent, links] of currParents.entries()) {
      walkParents(
        mainState,
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
  }
  if (
    patchStore &&
    // we only append patches to the main array for the root object
    // simpler case: no circular reference is found so we use absence of parents to append patches
    (!hasParents ||
      // if the target is the mainState we also know that we have to append the patches
      mainState === t)
  ) {
    for (let i = 0; i != currPatches.length; i++) {
      patchStore.patches.push(currPatches[i].patch);
      patchStore.inversePatches.push(currPatches[i].inverse);
    }
  }
}
