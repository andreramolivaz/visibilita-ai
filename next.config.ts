import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Il generatore di PDF gira in Node, fuori dal bundle.
  serverExternalPackages: ["@react-pdf/renderer"],
  // La vecchia pagina Metodo è diventata Come funziona (il white paper e i link vecchi puntano ancora lì).
  redirects() {
    return [{ source: "/metodo", destination: "/come-funziona", permanent: true }];
  },
};

export default nextConfig;
