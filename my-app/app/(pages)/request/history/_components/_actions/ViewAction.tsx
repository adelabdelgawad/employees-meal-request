"use client";

import React, { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import RequestLinesTable from "./RequestLinesTable";
import ConfirmationModal from "@/components/confirmation-dialog";
import clientAxiosInstance from "@/lib/clientAxiosInstance";

interface ViewActionProps {
  id?: number;
  disableStatus: boolean;
}

const ViewAction: React.FC<ViewActionProps> = ({ id, disableStatus }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [requestLines, setRequestLine] = useState([]);
  const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
      try {
        const response = await clientAxiosInstance.get(`/request-lines?request_id=${id}`);
        setRequestLine(response.data);
        setLoading(true)
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

  const handleLineDelete = async (id: number) => {
    try {
      await clientAxiosInstance.delete(`/history/request-line/${id}`);
      setRequestLine((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
    }
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
    fetchRequests();

  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const confirmSave = async () => {
    try {
      // Perform save operation here
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Error saving changes:", error);
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
            data={requestLines}
            disableStatus={disableStatus}
            onCancel={handleDrawerClose}
            onDelete={handleLineDelete}
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
