import ejs from "ejs";
import { promises as fs } from "fs";
import { issues, aboutPage, issueCovers } from "../prismic.js";

export default function () {
  return {
    name: "template-html-plugin",
    async generateBundle(_options, bundle) {
      for (const issue of issues) {
        const template = await fs.readFile("src/templates/issue.ejs", {
          encoding: "utf-8",
        });
        const html = ejs.render(template, {
          issue,
        });

        const fileName = `issue-${issue.number}.html`;

        bundle[fileName] = {
          fileName,
          source: html,
          isAsset: false,
          type: "asset",
        };
      }
    },
  };
}
