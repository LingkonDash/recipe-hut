import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/user/profile
 * Returns the current user's profile data.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image || null,
    },
  });
}

/**
 * PATCH /api/user/profile
 * Updates user profile: name and/or image URL.
 * Delegates to Better Auth's server-side updateUser API.
 * Password changing has been removed — manage passwords via your auth provider.
 */
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, image } = body as {
    name?: string;
    image?: string | null;
  };

  // ── Update name / image via Better Auth ──────────────────────────
  if (name !== undefined || image !== undefined) {
    try {
      const updateBody: Record<string, string | null> = {};
      if (name !== undefined) updateBody.name = name;
      if (image !== undefined) updateBody.image = image ?? null;

      await auth.api.updateUser({
        headers: await headers(),
        body: updateBody,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true, profileUpdated: true });
}
