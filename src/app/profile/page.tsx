import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = {
  title: "Profile | Recipe Hut",
  description: "View and edit your Recipe Hut profile details.",
};

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login");
  }

  // Pass initial values to the client form
  const initialSession = {
    name: session.user.name || "",
    email: session.user.email || "",
    image: session.user.image || null,
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfileClient initial={initialSession} />
    </div>
  );
}
