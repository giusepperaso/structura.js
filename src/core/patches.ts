import { shallowClone } from "../internals/copy";
import { Link } from "../proxy/createProxy";
import { UnFreeze } from "../helpers/freeze";
import { Traps_target, WithTraps } from "../helpers/traps";
import {
  Prop,
  Types,
  UnknownMap,
  UnknownObj,
  UnknownSet,
  isPrimitive,
  toStringType,
} from "../helpers/types";
import { Actions } from "../internals/walkParents";

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

export type PatchStore = { patches: Patch[]; inversePatches: Patch[] };
export type PatchPair = { patch: Patch; inverse: Patch };

export function applyPatches<T>(
  state: T,
  patches: Patch[] | JSONPatch[]
): UnFreeze<T> {
  let newState: T | object = state;
  let producerReturn;
  const clones: WeakMap<object, object> = new WeakMap();
  if (!isPrimitive(state)) {
    const unwrapState = (
      Traps_target in (state as WithTraps)
        ? (state as WithTraps)[Traps_target]
        : state
    ) as object;
    newState = shallowClone(unwrapState) as object;
    clones.set(unwrapState, newState);
    clones.set(newState, newState);
  }
  for (let i = 0; i !== patches.length; i++) {
    // you have to pass a different weakmap for each parent patch,
    // otherwise if the same patches are present at different levels,
    // they will not be used
    producerReturn = applyPatch(newState, patches[i], clones, new WeakSet());
    if (typeof producerReturn !== "undefined")
      newState = producerReturn as object;
  }
  return newState as UnFreeze<T>;
}

export function applyPatch<T>(
  current: T,
  patch: Patch | JSONPatch,
  clones: WeakMap<object, object>,
  traversedPatches: WeakSet<Patch | JSONPatch>
) {
  if (!patch) return;
  traversedPatches.add(patch);
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
      // handle the case in which we remove the last element from an array
      if (Array.isArray(current) && current.length - 1 === Number(patch.p))
        current.length -= 1;
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
          const childPatch = next[i];
          if (!traversedPatches.has(childPatch))
            applyPatch(
              childShallow as object,
              childPatch,
              clones,
              traversedPatches
            );
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
      const pathList = (Array.isArray(p) ? p : p.split("/"))
        .filter((p) => !!p || p === 0)
        .map((p) => (p === "__empty__" ? "" : p)); // allow "" as index in string version
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
          switch (toStringType(curr)) {
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
          switch (toStringType(curr)) {
            case Types.Map:
              if (action === "remove") (curr as UnknownMap).delete(key);
              else (curr as UnknownMap).set(key, patch.value);
              break;
            case Types.Set:
              if (action === "remove") (curr as UnknownSet).delete(key);
              else (curr as UnknownSet).add(key);
              break;
            default:
              if (action === "remove") {
                delete (curr as UnknownObj)[key as Prop];
                // handle the case in which we remove the last element from an array
                if (Array.isArray(curr) && curr.length - 1 === Number(key))
                  curr.length -= 1;
              } else {
                (curr as UnknownObj)[key as Prop] = patch.value;
              }
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
  converted: JSONPatch[] = [], // don't pass manually as argument
  traversedPatches: WeakSet<Patch> | null = null // don't pass manually as argument
): JSONPatch[] {
  let i = 0,
    l = patches.length;
  for (; i !== l; i++) {
    const patch = patches[i];
    // we may have circular references in patches in the next array, and this could create infinite loops;
    // to avoid that, we keep track of the already traversed patches for each child;
    // note that each patch in the main array generates a new weakset
    const traversed = traversedPatches || new WeakSet();
    if (traversed.has(patch)) continue;
    traversed.add(patch);
    const action = patch.op;
    // no_op operation is not needed for standard patches
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
        path: pathArray ? newPath : __stdBuildStringPath(newPath),
        value: patch.v,
      });
    }
    const next = patch.next;
    if (next) {
      convertPatchesToStandard(next, pathArray, newPath, converted, traversed);
    }
  }
  return converted;
}

// internal function to build string paths in standard patches
// we use a more complicated version instead of a simple join to allow "" as index in string version
function __stdBuildStringPath(newPath: unknown[]) {
  let ret = "";
  for (let i = 0; i !== newPath.length; i++) {
    const p = newPath[i];
    ret += "/" + (p === "" ? "__empty__" : p);
  }
  return ret;
}
