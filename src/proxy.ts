import { type NextRequest, NextResponse } from "next/server";

/**
 * Sanitize a URL slug:
 * 1. Lowercase
 * 2. Replace spaces and underscores with dashes
 * 3. Replace all illegal characters (not a-z or -) with dashes
 * 4. Collapse consecutive dashes
 * 5. Trim leading/trailing dashes
 */
function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\s_]/g, "-")
    .replace(/[^a-z-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Paths to skip - static assets, API routes, Next internals */
const IGNORED_PREFIXES = ["/_next", "/api", "/favicon.ico"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip root and ignored paths
  if (
    pathname === "/" ||
    IGNORED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Extract the first path segment as the slug
  const rawSlug = pathname.slice(1).split("/")[0];
  if (!rawSlug) return NextResponse.next();

  const sanitized = sanitizeSlug(rawSlug);

  // If empty after sanitization, redirect to home
  if (!sanitized) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If slug changed, redirect to the sanitized version (308 permanent)
  if (rawSlug !== sanitized) {
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${sanitized}`;
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
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
