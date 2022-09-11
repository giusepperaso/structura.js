import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Structura.js",
  description:
    "Fast typescript library for creating immutable states with structural sharing by using a mutable syntax",
  themeConfig: {
    //logo: "./logo.png",
    //siteTitle: false,
    siteTitle: "Structura.js",
    nav: [
      { text: "GitHub", link: "https://github.com/GiuseppeRaso/structura.js" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Why Structura?", link: "/why" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
    ],
  },
});
