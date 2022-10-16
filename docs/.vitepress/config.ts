import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Structura.js",
  base: "/structura.js/",
  description:
    "Fast typescript library for creating immutable states with structural sharing by using a mutable syntax",
  themeConfig: {
    logo: "https://github.com/GiuseppeRaso/structura.js/raw/master/docs/public/structural-sharing-1.jfif",
    siteTitle: "Structura.js", //siteTitle: false,
    nav: [
      { text: "GitHub", link: "https://github.com/GiuseppeRaso/structura.js" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/getting-started" },
          { text: "Why Structura?", link: "/why-structura" },
          { text: "When to use", link: "/when-to-use" },
          { text: "Freezing", link: "/freezing" },
          { text: "Patches", link: "/patches" },
          { text: "Edge cases", link: "/edge-cases" },
          { text: "Gotchas", link: "/gotchas" },
          { text: "Benchmarks", link: "/benchmarks" },
          { text: "Contributing", link: "/contribute" },
        ],
      },
    ],
  },
});
