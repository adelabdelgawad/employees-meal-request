'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchReportDetail } from '@/lib/services/report-details';

interface ReportDetailContextValue {
  setFromDate: (value: Date | null) => void;
  setToDate: (value: Date | null) => void;
  requests: ReportDetailRecord[];
  filteredRequests: ReportDetailRecord[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  mutate: () => Promise<void>;
}

const ReportDetailContext = createContext<ReportDetailContextValue | undefined>(
  undefined,
);

export const ReportDetailProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<ReportDetailRecord[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    ReportDetailRecord[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Function to fetch data with optional date filters
  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      const response = await fetchReportDetailRecords(fromDate, toDate);
      console.log('Fetched Data:', response);
      setRequests(response);
    } catch (error) {
      console.error('Failed to fetch report request data:', error);
    }
  };

  // Fetch data on initial mount and when date filters change
  useEffect(() => {
    fetchData(fromDate?.toISOString(), toDate?.toISOString());
  }, [fromDate, toDate]);

  // Filter requests based on search query
  useEffect(() => {
    const filtered = requests.filter((request) =>
      request.department.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

  return (
    <ReportDetailContext.Provider
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
    </ReportDetailContext.Provider>
  );
};

export const useReportDetail = (): ReportDetailContextValue => {
  const context = useContext(ReportDetailContext);
  if (!context) {
    throw new Error(
      'useReportDetail must be used within a ReportDetailProvider',
    );
  }
  return context;
};
