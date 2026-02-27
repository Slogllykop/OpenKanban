import { type NextRequest, NextResponse } from "next/server";

/**
 * Sanitize a URL slug:
 * 1. Decode URI components
 * 2. Lowercase
 * 3. Replace spaces and underscores with dashes
 * 4. Replace illegal characters (? ! @ etc.) with dashes
 * 5. Collapse consecutive dashes
 * 6. Trim leading/trailing dashes
 */
function sanitizeSlug(raw: string): string {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // If full decode fails, safely decode only the valid URI components piece by piece
    decoded = raw.replace(/(%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decodeURIComponent(match);
      } catch {
        return match;
      }
    });
  }

  return (
    decoded
      .toLowerCase()
      .replace(/[\s_]/g, "-")
      // biome-ignore lint/complexity/noUselessEscapeInRegex: Important for brakcets
      .replace(/[?!@#$%^&*()+=_\[\]{};':",.<>\/]/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

/** Paths to skip - static assets, API routes, Next internals */
const IGNORED_PREFIXES = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/og.png",
  "/OpenKanban-Logo.png",
];

export function proxy(request: NextRequest) {
  const { pathname, search, hash } = request.nextUrl;

  // Skip root and ignored paths
  if (
    pathname === "/" ||
    IGNORED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Extract the full path including search params and hash to correctly sanitize ? and #
  const fullPath = `${pathname}${search}${hash}`.slice(1);
  if (!fullPath) return NextResponse.next();

  const sanitized = sanitizeSlug(fullPath);

  // If empty after sanitization, redirect to home
  if (!sanitized) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If path changed, redirect to the sanitized version (308 permanent)
  if (fullPath !== sanitized) {
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${sanitized}`;
    newUrl.search = "";
    newUrl.hash = "";
    return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt, og.png, OpenKanban-Logo.png
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|og.png|OpenKanban-Logo.png).*)",
  ],
};
