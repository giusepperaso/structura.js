import { ItemData, createProxy } from "../proxy/createProxy";
import { isDraftable } from "../helpers/draft";
import { FreezeOnce, UnFreeze, freeze } from "../helpers/freeze";
import {
  Traps_item_data,
  Traps_target,
  WithTraps,
  target,
} from "../helpers/traps";
import {
  JSONPatch,
  Patch,
  PatchStore,
  convertPatchesToStandard,
} from "./patches";
import { CreateProxyHandler } from "../proxy/proxyHandler";
import { Settings } from "../helpers/settings";
import { Primitive } from "../helpers/types";
import { Actions } from "../internals/walkParents";

export type Producer<T, Q> = (draft: UnFreeze<T>) => Q | void | UnFreeze<T>;

export type ProduceOptions = { proxify?: typeof createProxy };

export type ProduceReturn<T, Q> = FreezeOnce<Q extends void ? T : Q>;

export type PatchCallback<T> = T extends Primitive
  ? never
  : (
      patches: Patch[] | JSONPatch[],
      inversePatches: Patch[] | JSONPatch[]
    ) => void;

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
      if (!Settings.standardPatches) {
        const op = Actions.producer_return;
        patchCallback([{ v: result, op }], [{ v: state, op }]);
      } else {
        const op = "replace";
        patchCallback([{ value: result, op }], [{ value: state, op }]);
      }
    }
    return result;
  }
  const data = new WeakMap();
  const pStore: PatchStore | null = patchCallback
    ? { patches: [], inversePatches: [] }
    : null;
  const handler = new CreateProxyHandler(state, data, pStore, proxify);
  let itemData: ItemData,
    unwrapState: T = state;
  if (Traps_item_data in (state as WithTraps)) {
    // if the state is already a draft, just use it
    unwrapState = (state as WithTraps<T>)[Traps_target];
    itemData = (state as WithTraps)[Traps_item_data];
  } else {
    itemData = proxify(state as object, data, handler);
  }
  const result = producer(itemData.proxy as UnFreeze<T>);
  const produced = itemData.modified ? itemData.shallow : unwrapState;
  const hasReturn = typeof result !== "undefined";
  if (patchCallback && pStore) {
    if (hasReturn) {
      if (!data.has(result as object)) pStore.patches = [];
      const op = Actions.producer_return;
      pStore.patches.push({ v: target(result), op });
      pStore.inversePatches.push({ v: produced, op });
    }
    if (!Settings.standardPatches) {
      patchCallback(pStore.patches, pStore.inversePatches.reverse());
    } else {
      patchCallback(
        convertPatchesToStandard(pStore.patches),
        convertPatchesToStandard(pStore.inversePatches.reverse())
      );
    }
  }
  const final = (hasReturn ? target(result) : produced) as R;
  if (Settings.autoFreeze) {
    freeze(state, true, true);
    freeze(final, true, true);
  }
  return final;
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

export function safeProduce<T>(...args: Parameters<typeof produce<T, T>>) {
  return produce<T, T>(...args);
}

export function safeProduceWithPatches<T>(
  ...args: Parameters<typeof produceWithPatches<T, T>>
) {
  return produceWithPatches<T, T>(...args);
}
