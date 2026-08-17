import { site } from "@/lib/site";

export default function sitemap() {
  const paths = [
    "",
    "/features",
    "/how-it-works",
    "/security",
    "/about",
    "/contact",
    "/demo",
    "/faq",
    "/privacy",
    "/terms",
    "/login",
  ];
  return paths.map((path) => ({
    url: `${site.url}${path || "/"}`,
    lastModified: new Date(),
  }));
}
