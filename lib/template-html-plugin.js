import ejs from "ejs";
import { promises as fs } from "fs";
import { issues, aboutPage, issueCovers } from "../utils/prismic.js";
import { rollupPluginHTML } from "@web/rollup-plugin-html";
import { minify as minifyJS } from "terser";
import { minify as minifyCSS } from "csso";

const issuesHtml = await Promise.all(
  issues.map(async (issue) => {
    const template = await fs.readFile("src/templates/issue.ejs", {
      encoding: "utf-8",
    });

    // TODO: remove

    const html = ejs.render(
      template,
      {
        issue,
      },
      {
        views: [`src/templates`],
      }
    );
    return { html, name: `issue-${issue.number}.html` };
  })
);

export default function () {
  return rollupPluginHTML({
    input: issuesHtml,
    minify: true,
    transformAsset: async (code, path) => {
      if (path.endsWith(".js")) {
        return await minifyJS(code.toString()).code;
      }
      if (path.endsWith(".css")) {
        return minifyCSS(code.toString()).css;
      }
    },
  });
}
