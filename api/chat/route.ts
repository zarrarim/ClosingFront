import { NextResponse } from "next/server";

// Simple Next.js route example with strict user validation
// Assumes you have authentication middleware that attaches `user` to the request
// (e.g. `req.user = { id: '...' }`). If you use a different approach (JWT, cookies),
// adapt the `reqUser` extraction accordingly.

async function getReqUser(req: Request) {
  // In some setups the user may be attached by middleware as (req as any).user
  // For app router / edge functions you might need to parse a token here instead.
  return (req as any).user ?? null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { userId, ...payload } = body || {};

  const reqUser = await getReqUser(req);

  // Enforce identity: do not trust client-provided `userId` alone.
  if (!reqUser || userId !== reqUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Proceed with handling the request, using `reqUser.id` as source of truth
  try {
    // TODO: insert chat generation logic here, e.g. save message, call AI, etc.
    const result = { ok: true, user: reqUser.id, payload };
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("chat route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Example: require authentication for GET as well
  const reqUser = await getReqUser(req);
  if (!reqUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO: return chat list or status
  return NextResponse.json({ ok: true, user: reqUser.id }, { status: 200 });
}
