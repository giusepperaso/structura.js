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
import { Primitive, Types, toStringType } from "../helpers/types";
import { Actions } from "../internals/walkParents";

export type DraftableState<T> = T | FreezeOnce<T>;

export type Producer<T, Q, IS_ASYNC = false> = (
  draft: UnFreeze<T>
) => IS_ASYNC extends true ? Promise<Q | void> : Q | void;

export type ProduceOptions = { proxify?: typeof createProxy };

export type DiscardVoid<Q, T> = Q extends void ? T : Q;

export type ProduceReturn<T, Q, IS_ASYNC = false> = IS_ASYNC extends true
  ? Promise<FreezeOnce<DiscardVoid<Q, T>>>
  : DiscardVoid<Q, T> extends Promise<unknown>
  ? never
  : FreezeOnce<DiscardVoid<Q, T>>;

export type PatchCallback<T> = T extends Primitive
  ? never
  : (
      patches: Patch[] | JSONPatch[],
      inversePatches: Patch[] | JSONPatch[]
    ) => void;

export const NOTHING = {};

export function produce<T, Q, IS_ASYNC = false>(
  state: DraftableState<T>,
  producer: Producer<T, Q, IS_ASYNC>,
  patchCallback?: PatchCallback<T>,
  { proxify = createProxy }: ProduceOptions = {}
): ProduceReturn<T, Q, IS_ASYNC> {
  type R = ProduceReturn<T, Q, IS_ASYNC>;
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
    unwrapState: DraftableState<T> = state;
  if (Traps_item_data in (state as WithTraps)) {
    // if the state is already a draft, just use it
    unwrapState = (state as WithTraps<T>)[Traps_target];
    itemData = (state as WithTraps)[Traps_item_data];
  } else {
    itemData = proxify(state as object, data, handler);
  }
  const resultOrPromise = producer(itemData.proxy as UnFreeze<T>);

  function processResult(result: void | Q | typeof NOTHING) {
    const produced = itemData.modified ? itemData.shallow : unwrapState;
    const hasReturn = typeof result !== "undefined";
    const isNOTHING = result === NOTHING;
    if (patchCallback && pStore) {
      if (hasReturn) {
        if (!isNOTHING && !data.has(result as object)) pStore.patches = [];
        const op = Actions.producer_return;
        pStore.patches.push({
          v: isNOTHING ? undefined : target(result),
          op,
        });
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
    if (isNOTHING) return undefined;
    const processed = (hasReturn ? target(result) : produced) as R;
    if (Settings.autoFreeze) {
      freeze(unwrapState, true, true);
      freeze(processed, true, true);
    }
    return processed;
  }

  if (toStringType(resultOrPromise) === Types.Promise) {
    return (resultOrPromise as Promise<Q | void>).then(processResult) as R;
  }

  return processResult(resultOrPromise) as R;
}

export function produceWithPatches<T, Q, IS_ASYNC = false>(
  state: DraftableState<T>,
  producer: Producer<T, Q, IS_ASYNC>
) {
  let patches: Patch[];
  let inverse: Patch[];
  function setPatches(_patches: Patch[], _inverse: Patch[]) {
    patches = _patches;
    inverse = _inverse;
  }
  const result = produce(state, producer, setPatches as PatchCallback<T>);
  return [result, patches!, inverse!] as const;
}

export async function asyncProduceWithPatches<T, Q>(
  state: DraftableState<T>,
  producer: Producer<T, Q, true>
) {
  let patches: Patch[];
  let inverse: Patch[];
  function setPatches(_patches: Patch[], _inverse: Patch[]) {
    patches = _patches;
    inverse = _inverse;
  }
  return produce(state, producer, setPatches as PatchCallback<T>).then(
    (result) => [result, patches!, inverse!] as const
  );
}

export const safeProduce: <T>(
  ...args: Parameters<typeof produce<T, T>>
) => ReturnType<typeof produce<T, T>> = produce;

export const safeProduceWithPatches: <T>(
  ...args: Parameters<typeof produceWithPatches<T, T>>
) => ReturnType<typeof produceWithPatches<T, T>> = produceWithPatches;

export const asyncProduce: <T, Q>(
  ...args: Parameters<typeof produce<T, Q, true>>
) => ReturnType<typeof produce<T, Q, true>> = produce;

export const asyncSafeProduce: <T>(
  ...args: Parameters<typeof produce<T, T, true>>
) => ReturnType<typeof produce<T, T, true>> = produce;

export const asyncSafeProduceWithPatches: <T>(
  ...args: Parameters<typeof asyncProduceWithPatches<T, T>>
) => ReturnType<typeof asyncProduceWithPatches<T, T>> = asyncProduceWithPatches;
