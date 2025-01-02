"use client";

import React, { useState, useEffect } from "react";

interface TableFilterProps {
    requests: any[]; // Array of request objects
    setFilteredRequests: (filtered: any[]) => void; // Function to update filtered requests
}

const TableFilter: React.FC<TableFilterProps> = ({ requests, setFilteredRequests }) => {
    // Helper function to format a date into "YYYY-MM-DDTHH:MM" (local time for datetime-local input)
    const formatToLocalDateTime = (date: Date) => {
        const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return offsetDate.toISOString().slice(0, 16);
    };

    // Default start date: Today at 00:00 (local time)
    const defaultStartDate = new Date();
    defaultStartDate.setHours(0, 0, 0, 0);

    // Default end date: Today at 23:59 (local time)
    const defaultEndDate = new Date();
    defaultEndDate.setHours(23, 59, 59, 999);

    const [status, setStatus] = useState<string>(""); // Status filter
    const [fromDate, setFromDate] = useState<string>(formatToLocalDateTime(defaultStartDate));
    const [toDate, setToDate] = useState<string>(formatToLocalDateTime(defaultEndDate));
    const [requester, setRequester] = useState<string>("");

    // Filter requests when filters change
    useEffect(() => {
        const filterRequests = () => {
            if (!requests || requests.length === 0) {
                setFilteredRequests([]);
                return;
            }

            let filtered = [...requests];

            // Filter by status
            if (status) {
                filtered = filtered.filter((req) => req.status_name.toLowerCase() === status.toLowerCase());
            }

            // Filter by date-time range
            filtered = filtered.filter((req) => {
                const requestDate = new Date(req.request_time);
                return requestDate >= new Date(fromDate) && requestDate <= new Date(toDate);
            });

            // Filter by requester (case-insensitive partial matching)
            if (requester.trim() !== "") {
                filtered = filtered.filter((req) =>
                    req.requester_name?.toLowerCase().includes(requester.toLowerCase())
                );
            }

            setFilteredRequests(filtered);
        };

        filterRequests();
    }, [status, fromDate, toDate, requester, requests, setFilteredRequests]);

    return (
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center">
            {/* Status Filter */}
            <div className="w-full md:w-1/4">
                <label htmlFor="statusFilter" className="block text-gray-700 font-semibold">
                    Status
                </label>
                <select
                    id="statusFilter"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Any</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {/* From Date-Time Filter */}
            <div className="w-full md:w-1/4">
                <label htmlFor="fromDateFilter" className="block text-gray-700 font-semibold">
                    From
                </label>
                <input
                    type="datetime-local"
                    id="fromDateFilter"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* To Date-Time Filter */}
            <div className="w-full md:w-1/4">
                <label htmlFor="toDateFilter" className="block text-gray-700 font-semibold">
                    To
                </label>
                <input
                    type="datetime-local"
                    id="toDateFilter"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Requester Filter */}
            <div className="w-full md:w-1/4">
                <label htmlFor="employeeFilter" className="block text-gray-700 font-semibold">
                    Requester
                </label>
                <input
                    type="text"
                    id="employeeFilter"
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    placeholder="Search Employees..."
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
};

export default TableFilter;
