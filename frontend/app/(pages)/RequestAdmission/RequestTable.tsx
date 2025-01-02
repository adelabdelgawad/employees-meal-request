import React, { useState, useEffect } from "react";
import { TableComponent } from "./RequestTableContent";
import { PaginationComponent } from "./PaginationComponent";

interface RequestTableProps {
    requests: any[];
}

const RequestTable: React.FC<RequestTableProps> = ({ requests }) => {
    const rowsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(requests.length / rowsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [requests]);

    const currentData = requests.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <div>

            <TableComponent
                currentData={currentData}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
            />
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onFirst={() => setCurrentPage(1)}
                onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                onLast={() => setCurrentPage(totalPages)}
                onPageChange={(page: number) => setCurrentPage(page)}
            />
        </div>
    );
};

export default RequestTable;
