"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function AboutMe() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(); // Redirect to login if the user is not authenticated
    }
  }, [status]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div>
        <p>User ID: {session.user.id}</p>
        <p>Roles: {session.user.roles.join(", ")}</p>
      </div>
    );
  }

  return null;
}
