// import React from 'react'
// import NewRequestForm from './NewRequestForm'
// import { getRequests } from '@/app/actions/request-requests';
// import { getNewRequestData } from '@/app/actions/new-request';

// export default async function Page() {
//   const userData: NewRequestDataResponse | null = await getNewRequestData();
//   return (
//     <div><NewRequestForm userData={userData}/></div>
//   )
// }
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle } from "lucide-react";
import NewRequestFormFooter from "./NewRequestFormFooter";


function page(){
  return (
    <div className="h-screen flex flex-col">
      {/* Top Row: 80% of screen */}
      <div className="flex-[40] p-1">
        <div className="grid grid-cols-3 gap-8 h-full">
          {/* Departments Column */}
          <div className="border rounded p-4 flex flex-col">
            <h2 className="text-2xl font-semibold mb-2">Departments</h2>
            <Input placeholder="Search Input ..." className="mb-2" />
            <div className="flex justify-between mb-4">
              <Button variant="outline" className="text-sm">
                <PlusCircle className="h-5 w-5" />
                Add All
              </Button>
              <Button variant="destructive" className="text-sm">
                <MinusCircle className="h-5 w-5" />
                Remove All{" "}
              </Button>
            </div>
            {/* Scrollable list area */}
            <div className="flex-1 border rounded overflow-auto p-2">
              {/* Replace with department items */}
            </div>
          </div>

          {/* Employees Column */}
          <div className="border rounded p-4 flex flex-col">
            <h2 className="text-2xl font-semibold mb-2">Employees</h2>
            <Input placeholder="Search Input ..." className="mb-2" />
            <div className="flex justify-between mb-2">
              <Button variant="outline" className="text-sm">
                <PlusCircle className="h-5 w-5" />
                Add All
              </Button>
              <Button variant="destructive" className="text-sm">
                <MinusCircle className="h-5 w-5" />
                Remove All{" "}
              </Button>
            </div>
            {/* Scrollable list area */}
            <div className="flex-1 border rounded overflow-auto p-2 mb-2">
              {/* Replace with employee items */}
            </div>
            {/* Add Selected Employees button */}
            <Button variant="default" className="w-full">
              Add Selected Employees
            </Button>
          </div>

          {/* Selected Employees Column */}
          <div className="border rounded p-4 flex flex-col">
            <h2 className="text-2xl font-semibold mb-2">Selected Employees</h2>
            <Input placeholder="Search Input ..." className="mb-2" />
            <div className="flex justify-between mb-2">
              <Button variant="destructive" className="text-sm">
                - Remove All
              </Button>
            </div>
            {/* Scrollable list area */}
            <div className="flex-1 border rounded overflow-auto p-2">
              {/* Replace with selected employees */}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Row: 20% of screen */}
      <NewRequestFormFooter />
    </div>
  );
};

export default page;
