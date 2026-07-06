import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportación estática en producción; en dev se desactiva para facilitar el desarrollo.
  output: process.env.NODE_ENV === "development" ? undefined : "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
