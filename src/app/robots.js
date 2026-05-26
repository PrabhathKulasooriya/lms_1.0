export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/terms", "/privacy"],
    },
    sitemap: "https://nexlearn.lk/sitemap.xml", 
  };
}
