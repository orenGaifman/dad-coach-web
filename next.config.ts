import type { NextConfig } from "next";

// Retired 2026-10-07: Dad Coach's dashboard moved to https://dad-coach-ui.onrender.com (a Vite SPA served from
// Render with the backend, dad-coach repo frontend/), the marketing and legal pages to https://dad-coach-site.onrender.com.
// Every old address redirects permanently, so links in old WhatsApp messages and in the Meta app settings keep working.
const SITE = "https://dad-coach-site.onrender.com";
const APP = "https://dad-coach-ui.onrender.com";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: SITE, permanent: true },
      { source: "/privacy", destination: `${SITE}/privacy/`, permanent: true },
      { source: "/terms", destination: `${SITE}/terms/`, permanent: true },
      { source: "/data-deletion", destination: `${SITE}/data-deletion/`, permanent: true },
      { source: "/belts/:file*", destination: `${APP}/belts/:file*`, permanent: true },
      { source: "/:path*", destination: `${APP}/login`, permanent: true },
    ];
  },
};

export default nextConfig;
