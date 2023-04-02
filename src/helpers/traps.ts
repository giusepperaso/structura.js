import { AllData, ItemData } from "../proxy/createProxy";

export const Traps_self = Symbol();
export const Traps_target = Symbol();
export const Traps_item_data = Symbol();
export const Traps_all_data = Symbol();

export type WithTraps<T = object> = {
  [Traps_self]: T;
  [Traps_target]: T;
  [Traps_item_data]: ItemData;
  [Traps_all_data]: AllData;
};

export function target<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return obj;
  return (obj as T & { [Traps_target]: T })[Traps_target] || obj;
}

export function original<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return obj;
  return (obj as T & { [Traps_self]: T })[Traps_self] || obj;
}

export function itemData<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return;
  return (obj as T & { [Traps_item_data]: ItemData })[Traps_item_data];
}

export function allData<T>(obj: T) {
  if (typeof obj === "undefined" || obj === null) return;
  return (obj as T & { [Traps_all_data]: WeakMap<object, ItemData> })[
    Traps_all_data
  ];
}
