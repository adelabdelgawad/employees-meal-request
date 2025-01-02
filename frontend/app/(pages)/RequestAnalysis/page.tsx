import { Metadata } from "next";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "./components/date-range-picker";
import OverviewComponent from "./overview";

export const metadata: Metadata = {
  title: "Request Analysis",
};

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-col p-2">
        {/* Header */}
        <div className="flex-none p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
              <Button>Download</Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            {/* Tabs List */}
            <TabsList className="flex-none">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Tabs Content */}
            <TabsContent value="overview" className="flex-1 overflow-auto">
              <OverviewComponent />
            </TabsContent>
            <TabsContent
              value="analytics"
              className="flex-1 overflow-auto flex items-center justify-center text-gray-500"
            >
              Analytics content goes here
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
