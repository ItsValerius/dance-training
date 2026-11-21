import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // every page is dynamic (session cookie), and Next 15+ keeps dynamic pages in the client cache for 0s,
    // so revisiting a page flashed its loading skeleton. Reuse visited pages for 30s; our server actions
    // call revalidatePath, so the user's own changes still show immediately.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
