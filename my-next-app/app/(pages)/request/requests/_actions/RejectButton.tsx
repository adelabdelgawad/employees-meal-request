/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import clientAxiosInstance from '@/lib/clientAxiosInstance';

interface RejectButtonProps {
  disabled: boolean;
  mutate: (data?: any, shouldRevalidate?: boolean) => Promise<any>;
  record: RequestRecord;
}

/**
 * RejectButton
 *
 * Provides an optimistic UI update for rejecting a request. If the backend
 * returns only partial data (e.g., new closed_time, new status), we merge
 * those fields into the existing record to avoid losing data.
 */
const RejectButton: React.FC<RejectButtonProps> = ({ disabled, mutate, record }) => {
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (disabled || loading) return;
    setLoading(true);

    // Prepare an optimistic version of the record.
    const optimisticRecord: RequestRecord = {
      ...record,
      status_id: 4,
      status_name: 'Rejected',
      // If you want to display closed_time optimistically:
      closed_time: new Date().toISOString(),
    };

    // 1) Optimistic update in the UI
    mutate(
      (currentData: RequestsResponse) => ({
        ...currentData,
        data: currentData.data.map((req: RequestRecord) =>
          req.id === record.id ? optimisticRecord : req
        ),
      }),
      false // do not revalidate immediately
    );

    try {
      // 2) Send the update to the server
      const response = await clientAxiosInstance.put(
        `/update-request-status?request_id=${record.id}&status_id=4`
      );
      const updatedRecordFromServer = response.data;

      // If your server returns the complete updated record, you can simply replace the old record:
      //    updatedRecord = updatedRecordFromServer
      //
      // But if your server returns only partial fields (e.g., closed_time, status_id, etc.),
      // merge them into the existing record to preserve other fields:
      const mergedUpdatedRecord: RequestRecord = {
        ...optimisticRecord, // Start with everything we had optimistically
        ...updatedRecordFromServer, // Overwrite only the fields returned by the server
      };

      // 3) Update the UI again with the final merged record
      mutate(
        (currentData: RequestsResponse) => ({
          ...currentData,
          data: currentData.data.map((req: RequestRecord) =>
            req.id === record.id ? mergedUpdatedRecord : req
          ),
        }),
        false // do not revalidate automatically
      );

      toast.success('Request updated successfully!');
    } catch (error) {
      toast.error('Failed to update the request. Please try again.');
      console.log(error)
      // 4) Revalidate to revert the optimistic update if something failed
      mutate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReject}
      className={`w-10 h-10 flex items-center justify-center rounded-full ${
        disabled || loading
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-red-200 cursor-pointer hover:brightness-105'
      }`}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <X size={24} />
      )}
    </button>
  );
};

export default RejectButton;
// eslint-disable-next-line @typescript-eslint/no-explicit-any