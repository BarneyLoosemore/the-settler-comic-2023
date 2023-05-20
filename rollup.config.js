import watchSrcPlugin from "./lib/watch-src-plugin.js";
import templateHtmlPlugin from "./lib/template-html-plugin.js";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: ["src/static/index.ts"],
  output: {
    dir: "build",
  },

  watch: {
    include: ["src/**/*"],
  },

  plugins: [watchSrcPlugin(), templateHtmlPlugin(), typescript(), terser()],
};
