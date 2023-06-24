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

const isLinkActive = (href, name) => {
  if (href === "/") {
    return name === "index";
  }
  return href.includes(name);
};

const renderTemplate = async (templatePath, data, name) => {
  const template = await fs.readFile(`src/templates/${templatePath}`, {
    encoding: "utf-8",
  });
  const sharedStyles = await fs.readFile(`src/static/css/index.css`, {
    encoding: "utf-8",
  });
  const styles = await fs.readFile(`src/static/css/${data.stylesheet}`, {
    encoding: "utf-8",
  });
  const inlineStyles = minifyCSS(sharedStyles + styles).css;
  const html = ejs.render(
    template,
    {
      ...data,
      navLinks: NAV_LINKS.map((link) => ({
        ...link,
        active: isLinkActive(link.href, name),
      })),
      bottomLinks: BOTTOM_LINKS,
      inlineStyles,
    },
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
    const preloads = [
      {
        href: issue.pages[0].image.src,
        as: "image",
      },
      {
        href: issue.pages[0].image.placeholder,
        imagesrcset: issue.pages[0].image.srcset,
        as: "image",
      },
    ];

    return await renderTemplate(
      "issue.ejs",
      {
        ...issue,
        preloads,
        stylesheet: "issue.css",
        pageTitle: `Issue ${issue.number}`,
      },
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
  "issue-list.ejs",
  {
    issueCovers,
    pageTitle: "Issues",
    prefetches: indexPagePrefetches,
    stylesheet: "issue-list.css",
  },
  "index"
);

const aboutHtml = await renderTemplate(
  "about.ejs",
  {
    description: aboutPageDescription.split("\\n"),
    pageTitle: "About",
    stylesheet: "about.css",
  },
  "about"
);

const archiveHtml = await renderTemplate(
  "archive.ejs",
  {
    issues,
    pageTitle: "Archive",
    stylesheet: "archive.css",
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
        return (await minifyJS(code.toString())).code;
      }
      if (path.endsWith(".css")) {
        return minifyCSS(code.toString()).css;
      }
    },
    extractAssets: true,
  });
}
