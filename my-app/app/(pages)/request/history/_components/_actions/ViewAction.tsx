"use client";

import React, { useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { toastWarning } from "@/lib/utils/toast";
import RequestLinesTable from "./RequestLinesTable";
import ConfirmationModal from "@/components/confirmation-dialog";
import useRequestLineState from "@/hooks/useRequestLineState";
import { updateRequestLine } from "@/lib/services/request-requests";

interface ViewActionProps {
  id?: number;
  disableStatus: boolean;
  handleRequestLinesChanges: (id: number, updatedRecord: any) => Promise<void>;
}

const ViewAction: React.FC<ViewActionProps> = ({
  id,
  disableStatus,
  handleRequestLinesChanges,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    data,
    changedStatus,
    loading,
    fetchData,
    updateChangedStatus,
    resetChangedStatus,
  } = useRequestLineState(id);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
    fetchData();
    resetChangedStatus();
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const confirmSave = async () => {
    setShowConfirmModal(false);

    if (changedStatus.length > 0) {
      try {
        const updatedData = await updateRequestLine(id!, changedStatus);
        await handleRequestLinesChanges(id!, updatedData);
        toast.success("Request lines updated successfully.");
        setIsDrawerOpen(false);
      } catch (error) {
        toast.error("Failed to save changes. Please try again.");
      }
    } else {
      toastWarning("No changes made.");
      setIsDrawerOpen(false);
    }
  };
  return (
    <div>
      {/* Trigger Button */}
      <Button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-black"
        onClick={handleDrawerOpen}
        title="View"
      >
        {loading ? "Loading..." : <Eye className="w-5 h-5" />}
      </Button>

      {/* Right-Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-500 ease-in-out w-[60rem] z-50`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">View Request Details</h3>
          <Button variant="ghost" onClick={handleDrawerClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 flex-grow overflow-y-auto border-t border-b border-gray-300">
          <RequestLinesTable
            data={data}
            disableStatus={disableStatus}
            onSwitchChange={updateChangedStatus}
            onSave={confirmSave}
            onCancel={handleDrawerClose}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-4"></div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Save"
        message="Are you sure you want to save these changes?"
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={confirmSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default ViewAction;
