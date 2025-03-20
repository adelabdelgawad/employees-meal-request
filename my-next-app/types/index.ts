// User and role types
export type Role = {
    id: string
    name: string
  }
  
  export type User = {
    id: number
    username: string
    fullName: string
    title: string
    roles: Record<string, boolean>
    active: boolean
  }
  
  