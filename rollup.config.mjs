import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { promises as fsp } from "fs";

export default {
  input: [`src/index.ts`],
  watch: true,
  output: {
    dir: "build",
    format: "cjs",
    assetFileNames: "[name]-[hash][extname]",
  },
  plugins: [
    {
      name: "add-assets",
      async buildStart() {
        this.emitFile({
          type: "asset",
          source: await fsp.readFile("src/static/index.html"),
          fileName: "index.html",
        });
      },
    },
    typescript(),
    terser(),
  ],
};
