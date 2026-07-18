"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  hasPassword: boolean;
}

interface InitialSession {
  name: string;
  email: string;
  image?: string | null;
}

export function ProfileClient({ initial }: { initial: InitialSession }) {
  // ── Profile state ────────────────────────────────────────────────
  const [name, setName] = useState(initial.name || "");
  const [imageUrl, setImageUrl] = useState(initial.image || "");
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  // ── Password state ───────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── UI state ─────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [imageError, setImageError] = useState("");

  // ── Load user profile to get hasPassword ─────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data: ProfileData = await res.json();
          setHasPassword(data.hasPassword);
          // Sync profile fields from server
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
        // Refresh the client session so navbar shows updated name
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

  // ── Change password ─────────────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "All password fields are required.",
      });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordMessage({
          type: "success",
          text: "Password changed successfully.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordMessage({
          type: "error",
          text: data.error || "Failed to change password.",
        });
      }
    } catch {
      setPasswordMessage({
        type: "error",
        text: "An unexpected error occurred.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const userInitial =
    name?.charAt(0).toUpperCase() ||
    initial.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center text-background font-bold text-2xl sm:text-3xl flex-shrink-0 select-none">
          {userInitial}
        </div>
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
      <form onSubmit={handleProfileSave} className="mb-10">
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
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                  imageError ? "border-primary" : "border-border"
                }`}
                placeholder="https://example.com/avatar.jpg"
              />
              {imageError && (
                <p className="text-xs text-primary mt-1">{imageError}</p>
              )}
            </div>
          </div>

          {/* Profile message */}
          {profileMessage && (
            <div
              className={`mt-5 px-4 py-3 rounded-lg text-sm ${
                profileMessage.type === "success"
                  ? "bg-secondary/10 text-secondary border border-secondary/20"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className="mt-6 w-full sm:w-auto bg-primary text-background px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* ── Password Section ───────────────────────────────────── */}
      {hasPassword === null ? (
        /* Loading skeleton */
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
          <div className="h-6 w-48 bg-border rounded animate-pulse mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-border rounded animate-pulse" />
            <div className="h-10 bg-border rounded animate-pulse" />
            <div className="h-10 bg-border rounded animate-pulse" />
          </div>
        </div>
      ) : hasPassword ? (
        <form onSubmit={handlePasswordChange}>
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Change Password
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            {/* Password message */}
            {passwordMessage && (
              <div
                className={`mt-5 px-4 py-3 rounded-lg text-sm ${
                  passwordMessage.type === "success"
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-6 w-full sm:w-auto bg-foreground text-background px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {passwordLoading && (
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
              {passwordLoading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      ) : (
        /* User has no password (e.g. Google sign-in) */
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Password
          </h2>
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-accent/10 border border-accent/20">
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
              className="text-accent flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-sm text-foreground">
              You signed in with <strong>Google</strong>. Your password is
              managed by your Google account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
