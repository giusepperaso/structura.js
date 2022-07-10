//@ts-nocheck
import { produce } from ".";

window.myObj = {};
window.result = produce(window.myObj, (draft) => {
  draft; // do something
});

// instructions for local debugging
// 1. duplicate this file and rename it as 'dev.ts'
// 2. modify the code in it (if you need types, remove @ts-nocheck)
// 3. run 'npm run dev'
