"use client";
import React from "react";

import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
    faAnglesLeft,
    faAnglesRight,

} from "@fortawesome/free-solid-svg-icons";


export const PaginationComponent: React.FC<{
    currentPage: number;
    totalPages: number;
    onFirst: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onLast: () => void;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onFirst, onPrevious, onNext, onLast, onPageChange }) => {
    const getVisiblePages = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage > 2) pages.push("...");
            const start = Math.max(1, currentPage - 1);
            const end = Math.min(totalPages, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 1) pages.push("...");
        }
        return pages;
    };

    return (
        <div className="mt-4 flex justify-center items-center space-x-2">
            <button
                className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={onFirst}
            >
                <FontAwesomeIcon icon={faAnglesLeft} className="mr-1" /> First
            </button>
            <button
                className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={onPrevious}
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {getVisiblePages().map((page, index) => (
                <React.Fragment key={index}>
                    {typeof page === "number" ? (
                        <button
                            className={`px-3 py-1 border rounded-md ${currentPage === page ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                                }`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    ) : (
                        <span className="px-2">{page}</span>
                    )}
                </React.Fragment>
            ))}
            <button
                className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={onNext}
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
                className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={onLast}
            >
                Last <FontAwesomeIcon icon={faAnglesRight} className="ml-1" />
            </button>
        </div>
    );
};