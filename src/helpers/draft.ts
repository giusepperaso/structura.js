import { Types, isPrimitive, toStringType } from "./types";
import { Traps_self } from "./traps";

export function isDraft<T>(obj: T) {
  return !isPrimitive(obj) && Traps_self in (obj as object);
}

export const DraftableTypes: string[] = Object.values(Types).filter(
  (v) => v.charAt(0) === "["
);

export function isDraftable(value: unknown): boolean {
  if (!value) return false;
  const type = typeof value;
  if (type === Types.function) return true;
  return type === Types.object && DraftableTypes.includes(toStringType(value));
}
