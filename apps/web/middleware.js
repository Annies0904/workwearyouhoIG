import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 只保護 /admin 與其子路由
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  // 沒設定就拒絕（避免後台裸奔）
  if (!user || !pass) {
    return new NextResponse("Admin credentials are not configured.", {
      status: 401,
    });
  }

  const auth = req.headers.get("authorization") || "";
  const [type, encoded] = auth.split(" ");

  if (type !== "Basic" || !encoded) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [u, p] = decoded.split(":");

  if (u === user && p === pass) return NextResponse.next();

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
