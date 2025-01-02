// This file is now a server component, so do NOT include "use client";

import React from "react";
import { getDepartments } from "@/utils/api"; // Import getDepartments from the api module

// This is a server component
// It fetches department data at render time on the server.
const Department = async () => {
  try {
    // Fetch department data using the API utility
    const data = await getDepartments();

    // Render fetched data
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Department Data</h1>
        <pre className="p-4 bg-gray-100 border rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  } catch (error: any) {
    // Handle fetch errors gracefully
    return (
      <div className="text-red-500">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error.message || "An unexpected error occurred."}</p>
      </div>
    );
  }
};

export default Department;
