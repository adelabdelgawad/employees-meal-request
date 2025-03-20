import type { User, Role } from "@/types"

// Define roles
export const roles: Role[] = [
  { id: "admin", name: "Administrator" },
  { id: "manager", name: "Manager" },
  { id: "editor", name: "Editor" },
  { id: "viewer", name: "Viewer" },
  { id: "analyst", name: "Analyst" },
  { id: "developer", name: "Developer" },
]

// Generate mock users with roles
export function generateUsers(count: number): User[] {
  const titles = [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Analyst",
    "Marketing Specialist",
    "HR Coordinator",
    "Financial Analyst",
    "Operations Manager",
    "Customer Support",
    "Sales Representative",
  ]

  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Emily",
    "David",
    "Sarah",
    "Robert",
    "Lisa",
    "William",
    "Jessica",
    "James",
    "Jennifer",
    "Daniel",
    "Amanda",
    "Matthew",
    "Ashley",
  ]

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Rodriguez",
    "Wilson",
    "Martinez",
    "Anderson",
    "Taylor",
    "Thomas",
    "Hernandez",
    "Moore",
  ]

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`

    // Randomly assign roles
    const userRoles: Record<string, boolean> = {}
    roles.forEach((role) => {
      userRoles[role.id] = Math.random() > 0.6
    })

    return {
      id: i + 1,
      username,
      fullName: `${firstName} ${lastName}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      roles: userRoles,
      active: Math.random() > 0.1, // Most users are active by default
    }
  })
}

// Simulate fetching users from a database
export async function getUsers(): Promise<User[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  const users =  generateUsers(1)
  console.log(users)
  return users
}

