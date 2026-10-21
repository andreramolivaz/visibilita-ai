import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rinnova la sessione Supabase a ogni richiesta e protegge /area.
 * (In Next.js 16 il file si chiama proxy, non middleware.)
 */
export async function proxy(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (req.nextUrl.pathname.startsWith("/area")) {
      return NextResponse.redirect(new URL("/accedi", req.url));
    }
    return NextResponse.next();
  }

  let risposta = NextResponse.next({ request: req });
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lista) => {
        for (const { name, value } of lista) req.cookies.set(name, value);
        risposta = NextResponse.next({ request: req });
        for (const { name, value, options } of lista) risposta.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user && req.nextUrl.pathname.startsWith("/area")) {
    return NextResponse.redirect(new URL("/accedi", req.url));
  }
  return risposta;
}

export const config = {
  matcher: ["/area/:path*", "/accedi", "/auth/:path*"],
};
