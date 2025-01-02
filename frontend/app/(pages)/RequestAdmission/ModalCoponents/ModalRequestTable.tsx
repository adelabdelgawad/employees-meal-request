"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface RequestLine {
    lineId: number;
    code?: string;
    name?: string;
    title?: string;
    department?: string;
    sign_in_time?: string;
    meal_type?: string;
    accepted?: boolean;
    notes?: string;
}

interface ModalRequestTableProps {
    request: RequestLine[];
    setRequest: React.Dispatch<React.SetStateAction<RequestLine[]>>;
    requestStatus: string;
}

/**
 * ModalRequestTable component displays request lines in a table.
 * Allows toggling "accepted" and editing "notes" if `requestStatus` is "Pending".
 */
const ModalRequestTable: React.FC<ModalRequestTableProps> = ({ request, setRequest, requestStatus }) => {
    /**
     * Handle checkbox state toggle for the "accepted" field of a line.
     *
     * @param {number} index - The index of the line to toggle.
     */
    const handleCheckboxChange = (index: number) => {
        if (requestStatus === "Pending") {
            setRequest((prevRequest) =>
                prevRequest.map((line, i) =>
                    i === index ? { ...line, accepted: !line.accepted } : line
                )
            );
        }
    };

    /**
     * Handle text input changes for the "notes" field of a line.
     *
     * @param {number} index - The index of the line being edited.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the text input.
     */
    const handleNoteChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (requestStatus === "Pending") {
            setRequest((prevRequest) =>
                prevRequest.map((line, i) =>
                    i === index ? { ...line, notes: value } : line
                )
            );
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Employee Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Attendance Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Accepted</TableHead>
                    <TableHead>Notes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {request.map((line, index) => (
                    <TableRow key={line.lineId || `index-${index}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{line.code || "N/A"}</TableCell>
                        <TableCell>{line.name || "N/A"}</TableCell>
                        <TableCell>{line.title || "N/A"}</TableCell>
                        <TableCell>{line.department || "N/A"}</TableCell>
                        <TableCell>
                            {line.sign_in_time
                                ? new Date(line.sign_in_time).toLocaleString("en-GB")
                                : "Not Attended"}
                        </TableCell>
                        <TableCell>{line.meal_type || "N/A"}</TableCell>
                        <TableCell>
                            <input
                                type="checkbox"
                                checked={line.accepted || false}
                                onChange={() => handleCheckboxChange(index)}
                                disabled={requestStatus !== "Pending"}
                            />
                        </TableCell>
                        <TableCell>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-1"
                                value={line.notes || ""}
                                onChange={(e) => handleNoteChange(index, e)}
                                readOnly={requestStatus !== "Pending"}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ModalRequestTable;
