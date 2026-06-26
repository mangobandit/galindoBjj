import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // ESLint is available via `npm run lint`; we don't block production
  // builds on style lint so the maintainer can always ship the demo.
  eslint: { ignoreDuringBuilds: true },
  // Pin the file-tracing root to this project. The machine has other
  // lockfiles higher up the tree, which otherwise confuses Next's inference.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default withNextIntl(nextConfig);
