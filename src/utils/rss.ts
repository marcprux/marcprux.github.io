import sanitizeHtml from "sanitize-html";
import { getAssetPath } from "./withBase";

// Use the same file URL in autodiscovery, navigation, and the feed's self-link.
export const RSS_PATH = getAssetPath("rss.xml");

export function prepareFeedContent(html: string, postUrl: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["id"],
      img: ["src", "alt", "title", "width", "height"],
    },
    transformTags: {
      "*": (tagName, attribs) => {
        // Feed readers need absolute URLs, including footnote links.
        for (const attribute of ["href", "src", "cite"]) {
          if (attribs[attribute]) {
            attribs[attribute] = new URL(attribs[attribute], postUrl).href;
          }
        }
        return { tagName, attribs };
      },
    },
  });
}
