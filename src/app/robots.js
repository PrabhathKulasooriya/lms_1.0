export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/icon.png", "/favicon.ico", "/favicon.svg"],
        disallow: [
          "/terms",
          "/privacy",
          "/dashboard",
          "/forgot-password",
          "/verify-email",
          "/reset-password",
        ],
      },
      {
        userAgent: "Googlebot-favicon",
        allow: "/",
      },
    ],
    sitemap: "https://nexlearn.lk/sitemap.xml",
  };
}
