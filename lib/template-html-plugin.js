import ejs from "ejs";
import { promises as fs } from "fs";
import { issues, aboutPageDescription, issueCovers } from "../api/prismic.js";
import { rollupPluginHTML } from "@web/rollup-plugin-html";
import { minify as minifyJS } from "terser";
import { minify as minifyCSS } from "csso";

const NAV_LINKS = [
  {
    href: "/",
    text: "issues",
  },
  {
    href: "/about",
    text: "about",
  },
  {
    href: "/archive",
    text: "archive",
  },
];

const BOTTOM_LINKS = [
  {
    href: "https://www.instagram.com/fennertoorac/",
    text: "instagram",
  },
  {
    href: "https://twitter.com/conorft",
    text: "twitter",
  },
  {
    href: "https://conorft.myportfolio.com/home",
    text: "website",
  },
  {
    href: "https://ko-fi.com/fennertoorac",
    text: "ko-fi",
  },
];

const renderTemplate = async (templatePath, data, name) => {
  const template = await fs.readFile(templatePath, { encoding: "utf-8" });
  const html = ejs.render(
    template,
    { ...data, bottomLinks: BOTTOM_LINKS },
    {
      views: [`src/templates`],
    }
  );
  return {
    html,
    name: `${name}.html`,
  };
};

const issuesHtml = await Promise.all(
  issues.map(async (issue) => {
    issue.pages = issue.pages.slice(0, 10); // TODO: remove this
    return await renderTemplate(
      "src/templates/issue.ejs",
      { ...issue, navLinks: NAV_LINKS, pageTitle: `Issue ${issue.number}` },
      `issue-${issue.number}`
    );
  })
);

const indexPagePrefetches = [
  ...issueCovers
    .filter(({ pathname }) => pathname)
    .map(({ pathname }) => ({
      href: pathname,
      as: "document",
    })),
];

const indexHtml = await renderTemplate(
  "src/templates/all-issues.ejs",
  {
    issueCovers,
    pageTitle: "Issues",
    prefetches: indexPagePrefetches,
    navLinks: NAV_LINKS.map((link) => ({
      ...link,
      active: link.href === "/",
    })),
  },
  "index"
);

const aboutHtml = await renderTemplate(
  "src/templates/about.ejs",
  {
    description: aboutPageDescription, // TODO: split this
    pageTitle: "About",
    navLinks: NAV_LINKS.map((link) => ({
      ...link,
      active: link.href === "/about",
    })),
  },
  "about"
);

const archiveHtml = await renderTemplate(
  "src/templates/archive.ejs",
  {
    issues,
    pageTitle: "Archive",
    navLinks: NAV_LINKS.map((link) => ({
      ...link,
      active: link.href === "/archive",
    })),
  },
  "archive"
);

const html = [...issuesHtml, indexHtml, aboutHtml, archiveHtml];

export default function () {
  return rollupPluginHTML({
    input: html,
    minify: true,
    transformAsset: async (code, path) => {
      if (path.endsWith(".js")) {
        console.log(path);
        return await minifyJS(code.toString()).code;
      }
      if (path.endsWith(".css")) {
        return minifyCSS(code.toString()).css;
      }
    },
  });
}
