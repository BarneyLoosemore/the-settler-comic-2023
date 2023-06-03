import * as prismicH from "@prismicio/helpers";

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

const getPageNumber = (title) => {
  const matches = title.match(/\d+/g);
  return Number(matches[matches.length - 1]);
};

export const formatPage = ({ page_title, page_content }, i) => {
  const pageNumber = getPageNumber(prismicH.asText(page_title));
  const isLCPImage = pageNumber === 1;
  return {
    title: prismicH.asText(page_title),
    number: pageNumber,
    image: {
      ...getImageSrcSet(page_content),
      placeholder: getPlaceholderImage(page_content),
      orientation: getImageOrientation(page_content),
      height: page_content.dimensions.height,
      width: page_content.dimensions.width,
      loading: isLCPImage ? "eager" : "lazy",
      fetchpriority: isLCPImage ? "high" : "low",
    },
  };
};

export const filterByIssue = (issue) => (doc) =>
  prismicH.asText(doc.issue_number) === issue;

const LATEST_ISSUE = 2;
export const formatIssueCover = ({ issue_title, issue_cover }) => {
  const title = prismicH.asText(issue_title);
  const issueNumber = Number(title.match(/\d+/)[0]);
  const pathname = title.toLowerCase().replace(/\s/g, "-");
  return {
    cover: issue_cover.url,
    title,
    number: issueNumber,
    pathname: issueNumber > LATEST_ISSUE ? null : pathname,
  };
};

export const sortAsc = (a, b) => a.number - b.number;
