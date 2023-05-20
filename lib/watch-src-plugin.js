import { glob } from "glob";

export default function () {
  return {
    name: "watch-src-plugin",
    async buildStart() {
      const files = await glob("src/**/*", { nodir: true });
      const filePaths = await Promise.all(
        files.map((file) => this.resolve(file))
      );

      for (const path of filePaths) {
        this.addWatchFile(path.id);
      }
    },
  };
}
