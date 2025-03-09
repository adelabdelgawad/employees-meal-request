import React, { useState, useCallback } from "react";
import { Trash } from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import toast from "react-hot-toast";
import clientAxiosInstance from "@/lib/clientAxiosInstance";

interface DeleteActionProps {
  id: number;
  disableStatus: boolean;
}

const DeleteAction: React.FC<DeleteActionProps> = ({
  id,
  disableStatus,
}) => {
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
      toast.success("Request Deleted Succeefully");
      return response.data;
    } catch (error) {
      toast.error("Failted to Deleting Request");
      console.error("Deleting Request:", error);
    }
   finally {
      closeDialog();
    }
  }, [id, closeDialog]);

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
