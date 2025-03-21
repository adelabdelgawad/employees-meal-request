import { Suspense } from "react"
import { getUsers } from "@/lib/actions/user.actions"
import UsersTable from "@/components/users/users-table";

// Loading component for Suspense
function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      <div className="h-10 w-full bg-muted rounded animate-pulse" />
      <div className="h-[500px] w-full bg-muted rounded animate-pulse" />
    </div>
  )
}

// Server component that fetches data
async function UsersTableServer() {
  // In a real app, this would fetch from a database
  const response: SettingUserResponse | null = await getUsers();
  const initialUsers = response?.users ?? []
  const roles = response?.roles ?? []
  const domainUsers = response?.domain_users ?? []
  
  return <UsersTable initialUsers={initialUsers} domainUsers={domainUsers} roles={roles}/>
}

export default function UsersPage() {
  return (
    <div>
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTableServer />
      </Suspense>
    </div>
  )
}

