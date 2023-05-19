import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import templateHtmlPlugin from "./lib/template-html-plugin.js";

export default {
  input: ["src/static/index.ts"],
  output: {
    dir: "build",
  },

  // watch all files in src/templates
  watch: {
    include: "src/templates/**",
  },

  plugins: [
    templateHtmlPlugin(),
    typescript(),
    terser(),
  ],
};
