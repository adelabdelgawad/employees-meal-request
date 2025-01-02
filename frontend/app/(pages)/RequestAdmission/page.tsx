"use client";

import React, { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import RequestTable from "./RequestTable";
import TableFilter from "./TableFilter";
import ModalController from "./ModalCoponents/ModalController";

const Page = () => {
    const [requests, setRequests] = useState(null); // Original data
    const [filteredRequests, setFilteredRequests] = useState([]); // Filtered data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);


    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get("http://172.31.26.165:1012/requests");
                setRequests(response.data);
                setFilteredRequests(response.data); // Initialize filtered requests with full data
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);



    if (loading) {
        return (
            <div className="container mx-auto p-4 flex justify-center items-center h-screen">
                <ClipLoader size={60} color="#4F46E5" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 bg-gray-100 ">
                <h1 className="text-2xl font-bold text-red-500">Error</h1>
                <p>Failed to fetch requests. Please try again later.</p>
            </div>
        );
    }



    return (
        <div className="container mx-auto p-0 bg-gray-100">
            <TableFilter requests={requests} setFilteredRequests={setFilteredRequests} />
            <RequestTable requests={filteredRequests} />

        </div>
    );
};

export default Page;
