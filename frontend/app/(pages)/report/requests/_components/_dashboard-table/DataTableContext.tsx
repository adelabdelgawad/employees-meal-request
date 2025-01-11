"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getRequests } from "@/app/_lib/data-fetcher";
import { RequestRecord } from "@/pages/definitions";

interface DataTableContextProps {
  requests: RequestRecord[];
  mutate: () => Promise<void>;
}

const DataTableContext = createContext<DataTableContextProps | undefined>(
  undefined
);

export const DataTableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<RequestRecord[]>([]);

  const fetchData = async () => {
    try {
      const response = await getRequests();
      setRequests(response);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataTableContext.Provider
      value={{
        requests,
        mutate: fetchData,
      }}
    >
      {children}
    </DataTableContext.Provider>
  );
};

export const useDataTable = () => {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTable must be used within a DataTableProvider");
  }
  return context;
};
