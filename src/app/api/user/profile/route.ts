import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/user/profile
 * Returns the current user's profile data + whether they have a credential (password) account.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the user has a credential (email/password) account
  let hasPassword = false;
  try {
    const accountsResponse = await auth.api.listUserAccounts({
      headers: await headers(),
    });

    // listUserAccounts returns an array of account objects
    const accounts = Array.isArray(accountsResponse)
      ? accountsResponse
      : [];
    hasPassword = accounts.some(
      (acc: { providerId?: string }) => acc.providerId === "credential"
    );
  } catch {
    // If listing accounts fails, default to false
    hasPassword = false;
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image || null,
    },
    hasPassword,
  });
}

/**
 * PATCH /api/user/profile
 * Updates user profile (name, image) and optionally changes password.
 * Delegates to Better Auth's server-side APIs.
 */
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, image, currentPassword, newPassword } = body as {
    name?: string;
    image?: string | null;
    currentPassword?: string;
    newPassword?: string;
  };

  const results: { profileUpdated?: boolean; passwordChanged?: boolean } = {};

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
      results.profileUpdated = true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  // ── Change password via Better Auth ──────────────────────────────
  if (currentPassword && newPassword) {
    try {
      await auth.api.changePassword({
        headers: await headers(),
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        },
      });
      results.passwordChanged = true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to change password";
      return NextResponse.json(
        { error: message, profileUpdated: results.profileUpdated ?? false },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ success: true, ...results });
}
