// Proxy CORS minimo para el portal de Coderland.
// Solo acepta peticiones desde ALLOWED_ORIGIN y solo reenvia a UPSTREAM/v1/*.
const UPSTREAM = "https://portal-colaborador.coderland.com";
const ALLOWED_ORIGIN = "https://sochoag.github.io";

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403 });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/v1/")) {
      return new Response("Not found", { status: 404, headers: cors });
    }
    const headers = new Headers();
    for (const h of ["Authorization", "Content-Type", "Accept"]) {
      const v = request.headers.get(h);
      if (v) headers.set(h, v);
    }
    const upstream = await fetch(UPSTREAM + url.pathname + url.search, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    });
    const out = new Headers(upstream.headers);
    out.delete("set-cookie");
    for (const [k, v] of Object.entries(cors)) out.set(k, v);
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};
