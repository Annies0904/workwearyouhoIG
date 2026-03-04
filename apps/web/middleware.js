import { NextResponse } from "next/server";

export function middleware(req) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return new NextResponse("Admin credentials are not configured.", { status: 401 });
  }

  const { pathname } = req.nextUrl;

  // --- Allowlist (避免無限 redirect) ---
  // 放行登入頁本身
  if (pathname === "/admin/login") return NextResponse.next();
  // 放行登入/登出 API（不然你永遠無法拿到 cookie）
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
