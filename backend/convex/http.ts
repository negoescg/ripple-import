import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const ALLOWED_ORIGINS = new Set([
  "https://coderippletech.com",
  "https://www.coderippletech.com",
  "http://localhost:8899",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://coderippletech.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

const contact = httpAction(async (_ctx, request) => {
  const headers = corsHeaders(request.headers.get("Origin"));

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid json" }, 400, headers);
  }

  // Honeypot: bots fill it, humans never see it. Pretend success.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true }, 200, headers);
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const topic = String(body.topic ?? "Something else").trim().slice(0, 100);
  const message = String(body.message ?? "").trim().slice(0, 5000);

  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "missing or invalid fields" }, 400, headers);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CodeRipple Contact <contact@coderippletech.com>",
      to: ["support@coderippletech.com"],
      reply_to: email,
      subject: `[${topic}] ${name}`,
      text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    console.error("resend failed", res.status, await res.text());
    return json({ ok: false, error: "delivery failed" }, 502, headers);
  }

  return json({ ok: true }, 200, headers);
});

const preflight = httpAction(async (_ctx, request) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get("Origin")) })
);

const http = httpRouter();
http.route({ path: "/contact", method: "POST", handler: contact });
http.route({ path: "/contact", method: "OPTIONS", handler: preflight });
export default http;
