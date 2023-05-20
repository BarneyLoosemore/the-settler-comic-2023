import fetch from "node-fetch";
import * as prismic from "@prismicio/client";
import * as prismicH from "@prismicio/helpers";
import open from "open";

// TODO: move this
import * as dotenv from "dotenv";
dotenv.config();

export const client = prismic.createClient(process.env.PRISMIC_REPO_NAME, {
  fetch,
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

const getImageSrcSet = (image) =>
  prismicH.asImageWidthSrcSet(image, {
    widths: [300, 600, 900],
    q: [25, 30, 15],
    fm: "webp",
  });

const getPlaceholderImage = (image) =>
  prismicH.asImageSrc(image, {
    width: 200,
    q: 1,
    blur: 5,
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
    .map(({ page_title, page_content }, i) => ({
      title: prismicH.asText(page_title),
      image: {
        ...getImageSrcSet(page_content),
        placeholder: getPlaceholderImage(page_content),
        loading: i === 0 ? "eager" : "lazy",
      },
    })),
}));

export const aboutPage = aboutData.map(({ content }) => ({
  description: prismicH.asHTML(content),
}));

export const issueCovers = issueData.map(({ issue_title, issue_cover }) => ({
  cover: issue_cover.url,
  title: prismicH.asText(issue_title),
}));

// console.log(issues[0].pages[0].image.placeholder);

// const imgSize = await fetch(issues[0].pages[25].image.placeholder).then((res) =>
//   res.headers.get("content-length")
// );
// const imgSize2 = await fetch(issues[0].pages[10].imageUrl.src).then((res) =>
//   res.headers.get("content-length")
// );

// console.log(`${imgSize / 1000}kb`);
// console.log(`${imgSize2 / 1000}kb`);
// open(issues[0].pages[25].image.placeholder);
// open(issues[0].pages[10].imageUrl.src);
