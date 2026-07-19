"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "@/components/ui/user-avatar";

interface InitialSession {
  name: string;
  email: string;
  image?: string | null;
}

export function ProfileClient({ initial }: { initial: InitialSession }) {
  // ── Profile state ────────────────────────────────────────────────
  const [name, setName] = useState(initial.name || "");
  const [imageUrl, setImageUrl] = useState(initial.image || "");

  // ── UI state ─────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [imageError, setImageError] = useState("");

  // ── Sync from server on mount ────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.user.name || "");
          setImageUrl(data.user.image || "");
        }
      } catch {
        // Fallback — just keep initial values
      }
    }
    loadProfile();
  }, []);

  // ── Validate image URL ───────────────────────────────────────────
  const validateImageUrl = (url: string): boolean => {
    if (!url) return true; // optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // ── Save profile ────────────────────────────────────────────────
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!name.trim()) {
      setProfileMessage({ type: "error", text: "Name is required." });
      return;
    }

    if (imageUrl && !validateImageUrl(imageUrl)) {
      setImageError("Please enter a valid URL.");
      return;
    }
    setImageError("");

    setProfileLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          image: imageUrl.trim() || null,
        }),
      });

      if (res.ok) {
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully.",
        });
        // Refresh the client session so navbar shows updated name/avatar
        await authClient.getSession();
      } else {
        const data = await res.json();
        setProfileMessage({
          type: "error",
          text: data.error || "Failed to update profile.",
        });
      }
    } catch {
      setProfileMessage({
        type: "error",
        text: "An unexpected error occurred.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 mb-10">
        {/* Avatar: shows real image if set, otherwise initials */}
        <UserAvatar
          name={name}
          email={initial.email}
          image={imageUrl || null}
          size={80}
        />
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {name || "Your Profile"}
          </h1>
          <p className="text-sm text-foreground-muted truncate mt-1">
            {initial.email}
          </p>
        </div>
      </div>

      {/* ── Profile Form ───────────────────────────────────────── */}
      <form onSubmit={handleProfileSave}>
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-secondary"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Personal Information
          </h2>

          <div className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={initial.email}
                readOnly
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground-muted text-sm cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Email cannot be changed.
              </p>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-foreground-muted"
                placeholder="Your name"
              />
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="profile-image"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Avatar Image URL{" "}
                <span className="text-foreground-muted font-normal">
                  (optional)
                </span>
              </label>
              <input
                id="profile-image"
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageError("");
                }}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-foreground-muted ${
                  imageError ? "border-red-400" : "border-border"
                }`}
                placeholder="https://example.com/avatar.jpg"
              />
              {imageError && (
                <p className="text-xs text-red-600 mt-1">{imageError}</p>
              )}
            </div>
          </div>

          {/* Profile message */}
          {profileMessage && (
            <div
              className={`mt-5 px-4 py-3 rounded-lg text-sm ${
                profileMessage.type === "success"
                  ? "bg-secondary/10 text-secondary border border-secondary/20"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className="mt-6 w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {profileLoading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {profileLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
