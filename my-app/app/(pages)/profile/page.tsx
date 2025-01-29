import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProfilePage() {
  // Retrieve session on the server
  const session = await auth();

  // Redirect if user is not authenticated
  if (!session?.user) {
    return redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent("/profile")}`
    );
  }

  const { user } = session;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Profile</h1>
      <UserInfo label="ID" value={user?.userId || "N/A"} />
      <UserInfo label="Name" value={user?.fullName || "N/A"} />
      <UserInfo label="Title" value={user?.userTitle || "N/A"} />
      <UserInfo
        label="Role"
        value={
          Array.isArray(user?.userRoles) ? user.userRoles.join(", ") : "N/A"
        }
      />
    </main>
  );
}

/**
 * Reusable component for displaying user information
 */
function UserInfo({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
}
