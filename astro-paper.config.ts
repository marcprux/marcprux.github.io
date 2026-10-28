import { res } from "./src/resources/paths";
import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://www.prux.org/",
    title: "Marc Prud'hommeaux",
    description:
      "Personal site and blog of Marc Prud'hommeaux — software developer based in New England.",
    author: "Marc Prud'hommeaux",
    profile: "https://www.linkedin.com/in/marcprux/",
    ogImage: res.images.socialPreview.slice(1),
    lang: "en",
    timezone: "America/New_York",
    dir: "ltr",
  },
  posts: {
    perPage: 250,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: false,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [
    { name: "mastodon", url: "https://mastodon.social/@marcprux" },
    { name: "linkedin", url: "https://www.linkedin.com/in/marcprux/" },
    { name: "mail", url: "mailto:mwp1@cornell.edu" },
  ],
  shareLinks: [
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?body=" },
  ],
});
