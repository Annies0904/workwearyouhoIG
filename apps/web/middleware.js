import { NextResponse } from "next/server";

export function middleware(req) {
  if (req.nextUrl.searchParams.get("__mw") === "1") {
    const auth = req.headers.get("authorization") || "";
    return NextResponse.json(
      {
        ok: true,
        mw: "cookie-session-allowlist-v1",
        pathname: req.nextUrl.pathname,
        hasAuthorizationHeader: auth.length > 0,
        authorizationFirst60: auth.slice(0, 60),
        cookieHeaderPresent: Boolean(req.headers.get("cookie")),
        hasAdminCookie: Boolean(req.cookies.get("admin_session")?.value),
      },
      { status: 200 }
    );
  }

  // ...下面才是 allowlist + cookie 檢查
}

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return new NextResponse("Admin credentials are not configured.", { status: 401 });
  }

  const { pathname } = req.nextUrl;

  // --- Allowlist (避免無限 redirect) ---
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }
  // -----------------------------------

  const session = req.cookies.get("admin_session")?.value;
  if (session === "1") return NextResponse.next();

  // 未登入：API 回 JSON；頁面導去登入頁
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
