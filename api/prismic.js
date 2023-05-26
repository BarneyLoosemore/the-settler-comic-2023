import fetch from "node-fetch";
import * as prismic from "@prismicio/client";
import * as prismicH from "@prismicio/helpers";
import { getColor, getPalette } from "colorthief";
import { filterByIssue, formatPage } from "./utils.js";

// TODO: move this
import * as dotenv from "dotenv";
dotenv.config();

const client = prismic.createClient(process.env.PRISMIC_REPO_NAME, {
  fetch,
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

const fetchByType = (type) =>
  client.getAllByType(type).then((pages) => pages.map(({ data }) => data));

const [pageData, aboutData, issueData] = await Promise.all([
  fetchByType("page"),
  fetchByType("about"),
  fetchByType("issue"),
]);

const uniqIssues = pageData
  .map(({ issue_number }) => prismicH.asText(issue_number))
  .filter((issue, i, arr) => arr.indexOf(issue) === i);

const issues = uniqIssues.map((issue) => {
  const pages = pageData.filter(filterByIssue(issue));
  const formattedPages = pages.map(({ page_title, page_content }, i) =>
    formatPage({ page_title, page_content })
  );

  return {
    number: issue,
    pages: formattedPages,
  };
});

const urlsToCache = issues.flatMap(({ pages }) =>
  pages.flatMap(({ image }) => [image.placeholder, ...image.srcset.split(",")])
);

const aboutPageDescription = aboutData.map(({ content }) => ({
  description: prismicH.asText(content),
}))[0].description;

const issueCovers = issueData.map(({ issue_title, issue_cover }) => ({
  cover: issue_cover.url,
  title: prismicH.asText(issue_title),
}));

export { issues, aboutPageDescription, issueCovers, urlsToCache };
