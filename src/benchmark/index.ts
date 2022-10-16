import fs from "fs";
import * as url from "url";
import { captureMultipleScreenshots, Page } from "./screenshot";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const RUN_BENCHMARKS = !process.env.npm_config_skip_benchmarks;
const RUN_SCREENSHOTS = !process.env.npm_config_skip_screenshots;
const RUN_COPY = !process.env.npm_config_skip_copy;

const pages: Page[] = [];

(async () => {
  const files = fs.readdirSync("./src/benchmark");
  for (const file of files) {
    const benchmark = file.match(/^([a-zA-Z_\-0-9]+)\.benchmark\.[tj]s$/);
    if (benchmark) {
      const [, name] = benchmark;
      if (RUN_BENCHMARKS) {
        await import("./" + file);
      }
      if (RUN_SCREENSHOTS) {
        pages.push({
          wait: 1500,
          url: `file://${__dirname}/../../../benchmark/results/${name}.chart.html`,
          name,
        });
      }
    }
  }

  if (RUN_SCREENSHOTS) {
    await captureMultipleScreenshots({
      folder: "./benchmark/results",
      pages,
    });
  }

  if (RUN_COPY) {
    const src = "./benchmark/results";
    const dest = "./docs/public/benchmark";
    fs.cpSync(src, dest, {
      recursive: true,
    });
    console.log("COPIED FROM " + src + " to " + dest);
  }
})();
