import fetch from "node-fetch";
import * as prismic from "@prismicio/client";
import * as prismicH from "@prismicio/helpers";

// TODO: move this
import * as dotenv from "dotenv";
dotenv.config();

export const client = prismic.createClient(process.env.PRISMIC_REPO_NAME, {
  fetch,
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

const fetchByType = (type) =>
  client.getAllByType(type).then((pages) => pages.map(({ data }) => data));

const filterByIssue = (issue) => (doc) =>
  prismicH.asText(doc.issue_number) === issue;

const [pageData, aboutData, issueData] = await Promise.all([
  fetchByType("page"),
  fetchByType("about"),
  fetchByType("issue"),
]);

const uniqIssues = pageData
  .map(({ issue_number }) => prismicH.asText(issue_number))
  .filter((issue, i, arr) => arr.indexOf(issue) === i);

export const issues = uniqIssues.map((issue) => ({
  number: issue,
  pages: pageData
    .filter(filterByIssue(issue))
    .map(({ page_title, page_content }) => ({
      title: prismicH.asText(page_title),
      imageUrl: page_content.url,
    })),
}));

export const aboutPage = aboutData.map(({ content }) => ({
  description: prismicH.asHTML(content),
}));

export const issueCovers = issueData.map(({ issue_title, issue_cover }) => ({
  cover: issue_cover.url,
  title: prismicH.asText(issue_title),
}));
