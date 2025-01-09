import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Home, Info } from "lucide-react" // Import icons
import React from "react"
import Dashboard from "./dashboard/Dashboard"

export default function Page() {
  return (
    <Tabs defaultValue="dashboard">
      <TabsList className="flex w-full">
        <div className="w-[25%]"></div> {/* Left padding */}
        <div className="flex w-[50%] justify-between">
          <TabsTrigger value="dashboard" className="flex-1 flex items-center justify-center gap-2">
            <Home size={18} />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="details" className="flex-1 flex items-center justify-center gap-2">
            <Info size={18} />
            Details
          </TabsTrigger>
        </div>
        <div className="w-[25%]"></div> {/* Right padding */}
      </TabsList>

      <TabsContent value="dashboard">
        <Dashboard />
      </TabsContent>

      <TabsContent value="details">
        <Dashboard />
      </TabsContent>
    </Tabs>
  )
}
