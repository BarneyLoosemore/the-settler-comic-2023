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

export const formatPage = ({ page_title, page_content }) => ({
  title: prismicH.asText(page_title),
  image: {
    ...getImageSrcSet(page_content),
    placeholder: getPlaceholderImage(page_content),
    orientation: getImageOrientation(page_content),
    height: page_content.dimensions.height,
    width: page_content.dimensions.width,
  },
});

export const filterByIssue = (issue) => (doc) =>
  prismicH.asText(doc.issue_number) === issue;
