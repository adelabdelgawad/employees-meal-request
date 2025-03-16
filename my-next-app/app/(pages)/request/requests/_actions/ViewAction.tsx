/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import RequestLinesTable from "./RequestLinesTable";
import ConfirmationModal from "@/components/confirmation-dialog";
import useRequestLineState from "@/hooks/useRequestLineState";
import { updateRequestLine } from "@/app/actions/request-requests";



interface ViewActionProps {
  disabled: boolean;
  mutate: (data?: any, shouldRevalidate?: boolean) => Promise<any>;
  record: RequestRecord;
}

const ViewAction: React.FC<ViewActionProps> = ({
  disabled,
  mutate,
  record,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [disableButton, isDisableButton] = useState<boolean>(true);


  const {
    data,
    changedStatus,
    loading,
    fetchData,
    updateChangedStatus,
    resetChangedStatus,
  } = useRequestLineState(record.id);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    fetchData();
    resetChangedStatus();
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if(changedStatus.length >= 1){
      isDisableButton(false)
    }else{
      isDisableButton(true)
    }
  }, [changedStatus]);


  const confirmSave = async () => {
    setShowConfirmModal(false);
    if (changedStatus.length === 0) return;

    // Prepare an optimistic record update.
    const optimisticRecord: RequestRecord = { ...record };

    // 1) Optimistically update the UI.
    mutate(
      (currentData: RequestsResponse) => ({
        ...currentData,
        data: currentData.data.map((req: RequestRecord) =>
          req.id === record.id ? optimisticRecord : req
        ),
      }),
      false // Do not revalidate immediately.
    );

    try {
      // 2) Send update to the server.
      const response = await updateRequestLine(record.id, changedStatus);
      const updatedRecordFromServer = response.data;

      // 3) Merge the optimistic record with the server response.
      const mergedRecord: RequestRecord = {
        ...optimisticRecord,
        ...updatedRecordFromServer,
      };

      // 4) Update the UI with the final record.
      mutate(
        (currentData: RequestsResponse) => ({
          ...currentData,
          data: currentData.data.map((req: RequestRecord) =>
            req.id === record.id ? mergedRecord : req
          ),
        }),
        false // Do not revalidate automatically.
      );

      toast.success("Request updated successfullsssy!");
      setIsDrawerOpen(false);

    } catch (error) {
      console.log(error)
      toast.error("Failed to update the request. Please try again.");
      // Revalidate to revert the optimistic update if server update fails.
      mutate();
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <Button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-black"
        onClick={openDrawer}
        title="View"
      >
        {loading ? "Loading..." : <Eye className="w-5 h-5" />}
      </Button>

      {/* Right-Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-500 ease-in-out w-[60rem] z-50 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">View Request Details</h3>
          <Button variant="ghost" onClick={closeDrawer}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 flex-grow overflow-y-auto border-t border-b border-gray-300">
          <RequestLinesTable
            data={data}
            disableStatus={disabled}
            saveDisable={disableButton}
            onSwitchChange={updateChangedStatus}
            onSave={confirmSave}
            onCancel={closeDrawer}
          />
        </div>

        {/* Drawer Footer (empty for now) */}
        <div className="flex justify-end gap-4 p-4"></div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Save"
        message="Are you sure you want to save these changes?"
        onConfirm={confirmSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default ViewAction;

/* eslint-disable @typescript-eslint/no-explicit-any */
