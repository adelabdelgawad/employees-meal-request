import React, { useState, useCallback } from "react";
import { Trash } from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import toast from "react-hot-toast";
import clientAxiosInstance from "@/lib/clientAxiosInstance";
import { HistoryRequest } from "../HistoryDataTable";

interface DeleteActionProps {
  id: number;
  disableStatus: boolean;
  setData: React.Dispatch<React.SetStateAction<HistoryRequest[]>>;
}

const DeleteAction: React.FC<DeleteActionProps> = ({ id, disableStatus, setData }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      const response = await clientAxiosInstance.delete(`/history/delete/${id}`);

      if (response.status === 204) {
        toast.success("Request Deleted Successfully");

        // Remove the deleted request from the UI
        setData(prevData => prevData.filter(item => item.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete the request.");
      console.error("Error deleting request:", error);
    } finally {
      closeDialog();
    }
  }, [id, setData, closeDialog]);

  return (
    <>
      <button
        onClick={openDialog}
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          disableStatus
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-red-500 text-white cursor-pointer hover:bg-red-600"
        }`}
        disabled={disableStatus}
      >
        <Trash size={20} />
      </button>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={closeDialog}
      />
    </>
  );
};

export default DeleteAction;
