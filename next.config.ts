import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    return [
      {
        // Apply these headers to all routes in the application
        source: "/(.*)",
        headers: [
          {
            // Restricts the sources from which content can be loaded.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            // Prevents the site from being embedded in an iframe
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Prevents the browser from guessing the MIME type, forcing it to use the declared content type
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Controls how much referrer information (like board slugs) is included with requests
            // 'strict-origin-when-cross-origin' only sends the origin for cross-origin requests
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Restricts the use of browser features and APIs (like camera, microphone, geolocation)
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Enforces HTTPS connections for the site and its subdomains for the specified duration (2 years)
            // 'preload' allows the site to be submitted to the HSTS preload list
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
