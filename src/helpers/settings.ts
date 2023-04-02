export const Settings = {
  strictCopy: false,
  autoFreeze: false,
  standardPatches: false,
};

export function enableStrictCopy(v = true) {
  Settings.strictCopy = v;
}
export function enableAutoFreeze(v = true) {
  Settings.autoFreeze = v;
}
export function enableStandardPatches(v = true) {
  Settings.standardPatches = v;
}
