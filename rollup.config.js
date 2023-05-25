import watchSrcPlugin from "./lib/watch-src-plugin.js";
import templateHtmlPlugin from "./lib/template-html-plugin.js";

export default {
  // input: "src/static/index.js",
  output: {
    dir: "build",
  },

  watch: {
    include: ["src/**/*"],
  },

  plugins: [templateHtmlPlugin()],
};
