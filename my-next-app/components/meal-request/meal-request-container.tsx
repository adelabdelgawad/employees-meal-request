import { Suspense } from "react"
import { MealRequestForm } from "./meal-request-form"
import { getNewRequestData } from "@/app/actions/request.actions"

// Loading component for Suspense
function MealRequestSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-[500px] w-full bg-muted rounded animate-pulse" />
      <div className="h-[200px] w-full bg-muted rounded animate-pulse" />
    </div>
  )
}

// Server component that fetches data
async function MealRequestServer() {
  // Fetch data
  const data = await getNewRequestData()

  return <MealRequestForm data={data} />
}

export function MealRequestContainer() {
  return (
    <Suspense fallback={<MealRequestSkeleton />}>
      <MealRequestServer />
    </Suspense>
  )
}

