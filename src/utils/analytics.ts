import { goatcounterEndpoint } from "@/analytics.config";

export const analyticsEndpoint =
  import.meta.env.PROD && goatcounterEndpoint ? goatcounterEndpoint : undefined;

export function trackingPixelUrl(
  path: string,
  title: string,
): string | undefined {
  if (!analyticsEndpoint) return undefined;
  const url = new URL(analyticsEndpoint);
  if (url.protocol !== "https:") {
    throw new Error("The analytics endpoint must use HTTPS.");
  }
  url.searchParams.set("p", path);
  url.searchParams.set("t", title);
  return url.href;
}
