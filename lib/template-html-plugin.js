import postHTML from "posthtml";
import { promises as fsp } from "fs";
import { issues, aboutPage, issueCovers } from "../prismic.js";

const insertContent = (node, content) => {
  const match = node.match(/{{.*}}/g)?.[0];
  if (!match) return node;
  const dataKey = match.replace(/{{|}}/g, "").trim();
  const value = content[dataKey];
  return node.replace(match, value);
};

const template = await fsp.readFile("src/templates/issue.html");

const constructPage = async (content) => {
  return await postHTML()
    .use((tree) => {
      tree.walk((node) => {
        // TODO: this is a hack
        if (typeof node === "string" && node.includes("pages")) {
          node = {
            tag: "ul",
            content: content.pages.map((page) => {
              return {
                tag: "li",
                content: [
                  {
                    tag: "img",
                    attrs: {
                      src: page.imageUrl,
                      alt: page.title,
                      loading: "lazy",
                    },
                  },
                ],
              };
            }),
          };
        }

        if (!node.tag && typeof node === "string") {
          node = insertContent(node, content);
        }

        if (
          node?.tag === "img" &&
          node.attrs.src &&
          node.attrs.src.match(/{{.*}}/g)
        ) {
          node.attrs.src = insertContent(node.attrs.src, content);
        }
        return node;
      });
    })
    .process(template);
};

export default function () {
  return {
    name: "template-html-plugin",
    async buildStart() {
      for (const issue of issues) {
        const pageContent = await constructPage(issue);
        await this.emitFile({
          type: "asset",
          source: pageContent.html,
          fileName: `issue/${issue.issueNumber}.html`,
        });
      }
    },
  };
}
