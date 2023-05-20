import ejs from "ejs";
import { promises as fs } from "fs";
import { issues, aboutPage, issueCovers } from "../utils/prismic.js";
import { rollupPluginHTML } from "@web/rollup-plugin-html";

const issuesHtml = await Promise.all(
  issues.map(async (issue) => {
    const template = await fs.readFile("src/templates/issue.ejs", {
      encoding: "utf-8",
    });

    // TODO: remove
    issue.pages = issue.pages.splice(0, 5);
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
  });
}
