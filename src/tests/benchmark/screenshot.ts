import fs from "fs";
import puppeteer from "puppeteer";

export type Page = { url: string; name: string; wait?: number };

export async function captureMultipleScreenshots({
  folder = "./screenshots",
  viewport = {
    width: 1280,
    height: 720,
  },
  pages,
}: {
  folder?: string;
  viewport?: { width: number; height: number };
  pages: Page[];
}) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  let browser = null;

  try {
    // launch headless Chromium browser
    browser = await puppeteer.launch({
      headless: true,
    });
    // create new page object
    const page = await browser.newPage();

    // set viewport width and height
    await page.setViewport(viewport);

    for (const p of pages) {
      const url = p.url;
      const name = p.name;
      const wait = p.wait;
      await page.goto(url);
      if (typeof wait === "number") {
        await waitMS(wait);
      }
      await page.screenshot({ path: `${folder}/${name}.jpg` });
      console.log(`✅ ${name} - (${url})`);
    }
    console.log(`\n🎉 ${pages.length} screenshots captured.`);
  } catch (err: any) {
    console.log(`❌ Error: ${err.message}`, pages);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function waitMS(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
