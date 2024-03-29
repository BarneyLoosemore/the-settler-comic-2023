import { urlsForSwCache } from "../api/prismic.js";
import { posix } from "path";
import { createHash } from "crypto";

export default function () {
  return {
    name: "inject-sw",
    async buildStart() {
      this.emitFile({
        type: "chunk",
        id: "src/sw.js",
        fileName: "sw.js",
      });
    },
    async generateBundle(_, bundle) {
      const swChunk = bundle["sw.js"];

      const toCacheInSW = Object.values(bundle).filter(
        (item) => item !== swChunk
      );

      const urls = [
        ...toCacheInSW.map((item) =>
          posix.relative(
            posix.dirname("sw.js"),
            item.fileName.endsWith(".html")
              ? item.fileName.replace(".html", "")
              : item.fileName
          )
        ),
        ...urlsForSwCache,
      ].map((url) => (url === "index" ? "/" : url));

      const versionHash = createHash("sha1");

      for (const item of toCacheInSW) {
        versionHash.update(item.code || item.source);
      }

      const version = versionHash.digest("hex");

      swChunk.code =
        `const ASSETS = ${JSON.stringify(urls)};\n` +
        `const VERSION = ${JSON.stringify(version)};\n` +
        swChunk.code;
    },
  };
}
