"use client";

import React from "react";

interface LoadingModalProps {
    isVisible: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="flex items-center justify-center h-48">
                <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            </div>
        </div>
    );
};

export default LoadingModal;
