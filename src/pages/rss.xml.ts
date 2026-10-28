import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getPostUrl } from "@/utils/getPostPaths";
import config from "@/config";
import { prepareFeedContent, RSS_PATH } from "@/utils/rss";
import { trackingPixelUrl } from "@/utils/analytics";

export async function GET() {
  const posts = await getCollection("posts");
  const sortedPosts = getSortedPosts(posts);
  const container = await AstroContainer.create();
  const items = await Promise.all(
    sortedPosts.map(async (post) => {
      const { data, id, filePath } = post;
      // Keep existing item URLs/GUIDs so subscribers don't get duplicate posts.
      const link = new URL(
        `${getPostUrl(id, filePath, config.site.lang).replace(/\/$/, "")}/`,
        config.site.url,
      ).href;
      const { Content } = await render(post);
      const html = await container.renderToString(Content, {
        request: new Request(link),
      });
      // Keep RSS image loads separate from browser page visits. The identifier
      // belongs to the article, never to a subscriber or an individual reader.
      const pixel = trackingPixelUrl(
        `/rss${new URL(link).pathname}`,
        data.title,
      );
      const image = pixel
        ? `<img src="${pixel.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}" width="1" height="1" alt="">`
        : "";
      return {
        link,
        title: data.title,
        description: data.description,
        content: prepareFeedContent(html + image, link),
        pubDate: new Date(data.pubDatetime),
      };
    }),
  );

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: config.site.url,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<atom:link href="${new URL(RSS_PATH, config.site.url).href}" rel="self" type="application/rss+xml" />`,
    items,
  });
}
