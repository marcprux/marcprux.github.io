import type { ResolvedAstroPaperConfig } from "@/types/config";
import { res } from "@/resources/paths";
import { getAssetPath } from "./withBase";

/** Resolve registered bundled image resources without constructing resource names. */
export function resolveDefaultOgImagePath(
  config: ResolvedAstroPaperConfig,
): string {
  const filename = config.site.ogImage;
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    throw new Error(
      "site.ogImage must be a single registered public image filename.",
    );
  }
  const registered = Object.values(res.images).find(
    (path) => path.slice(1) === filename,
  );
  if (registered) return getAssetPath(registered.slice(1));
  if (config.features.dynamicOgImage) {
    return getAssetPath(res.images.dynamicSocialPreview.slice(1));
  }
  throw new Error(
    `Register site.ogImage in src/resources/catalog.json: ${filename}`,
  );
}
