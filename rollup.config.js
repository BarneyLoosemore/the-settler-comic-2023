import templateHtmlPlugin from "./lib/template-html-plugin.js";
import injectSwPlugin from "./lib/inject-sw.plugin.js";
import terser from "@rollup/plugin-terser";

export default {
  output: {
    dir: "build",
  },

  watch: {
    include: ["src/**/*"],
  },

  plugins: [templateHtmlPlugin(), injectSwPlugin(), terser()],
};
