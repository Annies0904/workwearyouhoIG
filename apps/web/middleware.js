import { NextResponse } from "next/server";

export function middleware(req) {
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

  // Basic auth 的字串需要是 Latin-1；若含不合法字元，直接當作未授權
  let decoded = "";
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const i = decoded.indexOf(":");
  if (i < 0) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const u = decoded.slice(0, i);
  const p = decoded.slice(i + 1);

  if (u === user && p === pass) return NextResponse.next();

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
