import { getSession } from "@/lib/session";
import UserAvatarClient from "./UserAvatarClient";

/**
 * Server component that fetches the session and renders the UserAvatarClient component.
 * @returns The UserAvatarClient component with the fetched session.
 */
export default async function UserAvatarServer() {
  const session = await getSession();
  return <UserAvatarClient session={session} />;
}
