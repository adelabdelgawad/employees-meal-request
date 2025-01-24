"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { RequestRecord } from "@/pages/definitions";
import { getRequests } from "@/lib/services/request-requests";

interface RequestContextProps {
  requests: RequestRecord[];
  mutate: (patch?: Partial<RequestRecord>) => Promise<void>;
}

const RequestContext = createContext<RequestContextProps | undefined>(
  undefined
);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
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

  const mutate = async (patch?: Partial<RequestRecord>) => {
    if (patch) {
      setRequests((prev) =>
        prev.map((req) => (req.id === patch.id ? { ...req, ...patch } : req))
      );
      return;
    }
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <RequestContext.Provider
      value={{
        requests,
        mutate,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("useRequest must be used within a RequestProvider");
  }
  return context;
};
