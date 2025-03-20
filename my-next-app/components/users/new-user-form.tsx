"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { User, Role } from "@/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SheetFooter } from "@/components/ui/sheet"

interface NewUserFormProps {
  roles: Role[]
  onSave: (newUser: Omit<User, "id">) => void
  onCancel: () => void
}

export function NewUserForm({ roles, onSave, onCancel }: NewUserFormProps) {
  const initialRoles: Record<string, boolean> = {}
  roles.forEach((role) => {
    initialRoles[role.id] = false
  })

  const [formData, setFormData] = useState<Omit<User, "id">>({
    username: "",
    fullName: "",
    title: "",
    roles: initialRoles,
    active: true,
  })

  const [hasChanges, setHasChanges] = useState(false)

  // Check if any changes have been made
  useEffect(() => {
    const hasValues = formData.username.trim() !== "" || formData.fullName.trim() !== "" || formData.title.trim() !== ""
    const hasRoles = Object.values(formData.roles).some((value) => value)
    setHasChanges(hasValues || hasRoles)
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        [roleId]: !prev.roles[roleId],
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" value={formData.username} onChange={handleInputChange} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="new-user-active" className="flex-1">
            User Status
          </Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="new-user-active" className={formData.active ? "text-green-500" : "text-red-500"}>
              {formData.active ? "Active" : "Disabled"}
            </Label>
            <Switch
              id="new-user-active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Roles</Label>
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between">
                <Label htmlFor={`new-role-${role.id}`} className="flex-1">
                  {role.name}
                </Label>
                <Switch
                  id={`new-role-${role.id}`}
                  checked={formData.roles[role.id]}
                  onCheckedChange={() => handleRoleToggle(role.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <SheetFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!hasChanges}>
          Create User
        </Button>
      </SheetFooter>
    </form>
  )
}

