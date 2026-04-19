export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://prideborn.io";
  const now = new Date();
  const routes = ["", "/features", "/industries", "/pricing", "/about", "/dashboard"];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
