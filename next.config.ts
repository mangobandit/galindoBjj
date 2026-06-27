import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

function supabaseStorageRemotePattern() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // ESLint is available via `npm run lint`; we don't block production
  // builds on style lint so the maintainer can always ship the demo.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: supabaseStorageRemotePattern(),
  },
  // Pin the file-tracing root to this project. The machine has other
  // lockfiles higher up the tree, which otherwise confuses Next's inference.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default withNextIntl(nextConfig);
