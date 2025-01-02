"use client";
import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import ModalController from "./ModalCoponents/ModalController";

interface TableComponentProps {
    currentData: any[];
    currentPage: number;
    rowsPerPage: number;
}

export const TableComponent: React.FC<TableComponentProps> = ({
    currentData,
    currentPage,
    rowsPerPage,
}) => {
    const [requestStatus, setRequestStatus] = useState("Pending");

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(0);

    const handleViewRequest = (requestId: number, requestStatus: string) => {
        setRequestStatus(requestStatus);
        setSelectedRequestId(requestId);
        setModalVisible(true);
    };


    return (
        <div>
            <ModalController
                isVisible={modalVisible}
                setModalVisible={setModalVisible}
                requestId={selectedRequestId}
                requestStatus={requestStatus}

            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">#</TableHead>
                        <TableHead className="text-center">Requester</TableHead>
                        <TableHead className="text-center">Title</TableHead>
                        <TableHead className="text-center">Request Time</TableHead>
                        <TableHead className="text-center">Closed Time</TableHead>
                        <TableHead className="text-center">Notes</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Accepted</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentData.map((request, index) => {
                        const isDisabled =
                            request.status_name === "Approved" || request.status_name === "Rejected";

                        return (
                            <TableRow key={request.meal_request_id || index}>
                                <TableCell className="text-center">
                                    {(currentPage - 1) * rowsPerPage + index + 1}
                                </TableCell>
                                <TableCell className="text-center">{request.requester_name}</TableCell>
                                <TableCell className="text-center">
                                    {request.requester_title || "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                    {new Date(request.request_time).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    {request.closed_time
                                        ? new Date(request.closed_time).toLocaleString()
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-center">{request.notes || "-"}</TableCell>
                                <TableCell className="text-center">{request.meal_type || "-"}</TableCell>
                                <TableCell className="text-center">
                                    {request.total_request_lines || "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span
                                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${request.status_name === "Approved"
                                            ? "bg-green-200 text-green-800"
                                            : request.status_name === "Pending"
                                                ? "bg-yellow-200 text-yellow-800"
                                                : "bg-red-200 text-red-800"
                                            }`}
                                    >
                                        {request.status_name || "Unknown"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center flex justify-center space-x-2">
                                    <button
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => handleViewRequest(request.meal_request_id, request.status_name)}
                                    >
                                        <FontAwesomeIcon icon={faEye} size="lg" />
                                    </button>
                                    <button
                                        className={`text-green-500 ${isDisabled
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:text-green-700"
                                            }`}
                                        disabled={isDisabled}
                                    >
                                        <FontAwesomeIcon icon={faCheck} size="lg" />
                                    </button>
                                    <button
                                        className={`text-red-500 ${isDisabled
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:text-red-700"
                                            }`}
                                        disabled={isDisabled}
                                    >
                                        <FontAwesomeIcon icon={faTimes} size="lg" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

        </div>
    );
};
