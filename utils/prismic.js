import fetch from "node-fetch";
import * as prismic from "@prismicio/client";
import * as prismicH from "@prismicio/helpers";
import { getColor, getPalette } from "colorthief";

// TODO: move this
import * as dotenv from "dotenv";
dotenv.config();

export const client = prismic.createClient(process.env.PRISMIC_REPO_NAME, {
  fetch,
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

const getImageOrientation = (image) => {
  const { width, height } = image.dimensions;
  return width > height ? "landscape" : "portrait";
};

const getImageSrcSet = (image) =>
  prismicH.asImageWidthSrcSet(image, {
    widths: [300, 600, 1200],
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

export const issues = await Promise.all(
  uniqIssues.map(async (issue) => {
    const pages = pageData.filter(filterByIssue(issue));
    const formattedPages = await Promise.all(
      pages.map(async ({ page_title, page_content }, i) => ({
        title: prismicH.asText(page_title),
        image: {
          ...getImageSrcSet(page_content),
          placeholder: getPlaceholderImage(page_content),
          orientation: getImageOrientation(page_content),
          height: page_content.dimensions.height,
          width: page_content.dimensions.width,
          loading: i === 0 ? "eager" : "lazy",
          aspectRatio:
            page_content.dimensions.width / page_content.dimensions.height,
          // palette: await getColor(page_content.url),
        },
      }))
    );

    return {
      number: issue,
      pages: formattedPages,
    };
  })
);

export const urlsToCache = issues.flatMap(({ pages }) =>
  pages.flatMap(({ image }) => [image.placeholder, ...image.srcset.split(",")])
);

// issues[0].pages.forEach(({ image }) => {
//   console.log(image.palette);
// });

export const aboutPage = aboutData.map(({ content }) => ({
  description: prismicH.asHTML(content),
}));

export const issueCovers = issueData.map(({ issue_title, issue_cover }) => ({
  cover: issue_cover.url,
  title: prismicH.asText(issue_title),
}));
