import { NextResponse } from "next/server";

export function middleware(req) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return new NextResponse("Admin credentials are not configured.", { status: 401 });
  }

  const session = req.cookies.get("admin_session")?.value;
  if (session === "1") return NextResponse.next();

  // 沒登入：若是 API，回 JSON；若是頁面，導去 /admin/login（你等下可做簡單頁）
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
