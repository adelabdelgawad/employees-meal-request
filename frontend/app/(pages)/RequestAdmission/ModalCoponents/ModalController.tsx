"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalRequestTable from "./ModalRequestTable";
import LoadingModal from "./LoadingModal";

interface ModalControllerProps {
    isVisible: boolean;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    requestId: number;
    requestStatus: string;
}

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

const ModalController: React.FC<ModalControllerProps> = ({
    isVisible,
    setModalVisible,
    requestId,
    requestStatus,
}) => {
    const [request, setRequest] = useState<RequestLine[]>([]);
    const [originalRequest, setOriginalRequest] = useState<RequestLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [saveValue, setSaveValue] = useState(false);
    const [cache, setCache] = useState<Record<number, RequestLine[]>>({});

    useEffect(() => {
        if (requestId && requestId > 0) {
            const fetchRequest = async () => {
                setLoading(true);
                try {
                    if (cache[requestId]) {
                        setRequest(cache[requestId]);
                        setOriginalRequest(cache[requestId]);
                    } else {
                        const response = await axios.get(
                            `http://172.31.26.165:1012/request-lines?request_id=${requestId}`
                        );
                        setRequest(response.data);
                        setOriginalRequest(response.data);
                        setCache((prevCache) => ({
                            ...prevCache,
                            [requestId]: response.data,
                        }));
                    }
                } catch (err) {
                    setError(true);
                } finally {
                    setLoading(false);
                }
            };
            fetchRequest();
        }
    }, [requestId, cache]);

    const closeModal = () => {
        setModalVisible(false);
    };

    const hasChanges = () => {
        return request.some((line) => {
            const original = originalRequest.find((o) => o.lineId === line.lineId);
            if (!original) return false;
            return original.accepted !== line.accepted || original.notes !== line.notes;
        });
    };

    const saveModal = async () => {
        setSaveValue(true);

        const changes: string[] = [];

        request.forEach((line) => {
            const original = originalRequest.find((o) => o.lineId === line.lineId);

            if (!original) return;

            if (original.accepted !== line.accepted) {
                if (line.accepted === true) {
                    changes.push(`changed to Accepted(${line.lineId})`);
                } else {
                    changes.push(`unchecked Accepted(${line.lineId})`);
                }
            }

            if (original.notes !== line.notes) {
                changes.push(`changed Notes(${line.lineId}, ${line.notes})`);
            }
        });

        changes.forEach((change) => console.log(change));

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSaveValue(false);
        closeModal();
    };

    if (!isVisible || requestId === null) return null;

    return (
        <>
            {/* Loading Modal */}
            <LoadingModal isVisible={loading} />

            {/* Main Modal */}
            {!loading && (
                <div
                    className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onClick={closeModal}
                >
                    <div
                        className="modal-content bg-white p-4 rounded shadow-lg relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            Close
                        </button>
                        {error ? (
                            <p>Failed to load data. Please try again later.</p>
                        ) : (
                            <>
                                <ModalRequestTable
                                    request={request}
                                    setRequest={setRequest}
                                    requestStatus={requestStatus}
                                />
                                <div className="flex justify-end mt-4 space-x-2">
                                    <button
                                        onClick={closeModal}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveModal}
                                        className={`px-4 py-2 rounded ${!hasChanges() || saveValue
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                            }`}
                                        disabled={!hasChanges() || saveValue}
                                    >
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ModalController;
