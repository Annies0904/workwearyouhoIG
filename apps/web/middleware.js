import { NextResponse } from "next/server";

export function middleware(req) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  // 沒設定就拒絕（避免後台裸奔）
  if (!user || !pass) {
    return new NextResponse("Admin credentials are not configured.", { status: 401 });
  }

  const session = req.cookies.get("admin_session")?.value;
  if (session === "1") return NextResponse.next();

  // 未登入：API 回 JSON；頁面導去登入頁
  const { pathname } = req.nextUrl;

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
