import ejs from "ejs";
import { promises as fs } from "fs";
import { issues, aboutPageDescription, issueCovers } from "../api/prismic.js";
import { rollupPluginHTML } from "@web/rollup-plugin-html";
import { minify as minifyJS } from "terser";
import { minify as minifyCSS } from "csso";
import { promises as fsp } from "fs";

const renderTemplate = async (templatePath, data) => {
  const template = await fs.readFile(templatePath, { encoding: "utf-8" });
  return ejs.render(template, data, {
    views: [`src/templates`],
  });
};

const issuesHtml = issues.map(async (issue) => {
  issue.pages = issue.pages.slice(0, 10); // TODO: remove this
  const html = await renderTemplate("src/templates/issue.ejs", issue);
  return { html, name: `issue-${issue.number}.html` };
});

const indexHtml = {
  html: (await fsp.readFile("src/static/index.html")).toString(),
  name: "index.html",
};

const aboutHtml = {
  html: await renderTemplate("src/templates/about.ejs", {
    description: aboutPageDescription,
    preloads: null,
  }),
  name: "about.html",
};

const html = await Promise.all([...issuesHtml, indexHtml, aboutHtml]);

export default function () {
  return rollupPluginHTML({
    input: html,
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
