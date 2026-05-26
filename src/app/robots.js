export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/terms",
        "/privacy",
        "/dashboard",
        "/forgot-password",
        "/verify-email",
        "/reset-password",
      ],
    },
    sitemap: "https://nexlearn.lk/sitemap.xml",
  };
}
