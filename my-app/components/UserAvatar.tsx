// UserAvatarServer.tsx

import { getSession } from "@/lib/session"; // Ensure getSession returns session data correctly.
import UserAvatarClient from "./UserAvatarClient";

/**
 * Server component that retrieves the session from cookies
 * and passes it to the client component.
 *
 * @returns {JSX.Element} The rendered UserAvatarClient with session data.
 */
export default async function UserAvatarServer() {
  const session = await getSession();
  return <UserAvatarClient session={session} />;
}
