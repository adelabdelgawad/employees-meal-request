"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchReportRequestRecords } from "@/lib/actions/report-request";

type ReportRequestRecord = {
  id: number;
  department: string;
  dinnerRequests: number;
  lunchRequests: number;
};

interface ReportRequestContextValue {
  setFromDate: (value: Date | null) => void;
  setToDate: (value: Date | null) => void;
  requests: ReportRequestRecord[];
  filteredRequests: ReportRequestRecord[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  mutate: () => Promise<void>;
}

const ReportRequestContext = createContext<
  ReportRequestContextValue | undefined
>(undefined);

export const ReportRequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<ReportRequestRecord[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    ReportRequestRecord[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Function to fetch data with optional date filters
  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      const response = await fetchReportRequestRecords(fromDate, toDate);
      setRequests(response);
    } catch (error) {
      console.error("Failed to fetch report request data:", error);
    }
  };

  // Fetch data on initial mount and when date filters change
  useEffect(() => {
    fetchData(fromDate?.toISOString(), toDate?.toISOString());
  }, [fromDate, toDate]);

  // Filter requests based on search query
  useEffect(() => {
    const filtered = requests.filter((request) =>
      request.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

  return (
    <ReportRequestContext.Provider
      value={{
        setFromDate,
        setToDate,
        requests,
        filteredRequests,
        searchQuery,
        setSearchQuery,
        mutate: fetchData,
      }}
    >
      {children}
    </ReportRequestContext.Provider>
  );
};

export const useReportRequest = (): ReportRequestContextValue => {
  const context = useContext(ReportRequestContext);
  if (!context) {
    throw new Error(
      "useReportRequest must be used within a ReportRequestProvider"
    );
  }
  return context;
};
