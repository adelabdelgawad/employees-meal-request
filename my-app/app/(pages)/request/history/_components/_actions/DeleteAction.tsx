import React, { useState, useCallback } from "react";
import { Trash } from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import toast from "react-hot-toast";

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
      const response = await fetch(`/api/requests/delete-request?id=${id}`, {
        method: 'DELETE',
      });
      

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Failed to delete request: ${errorText}`);
        throw new Error(`Failed to delete request: ${errorText}`);
      }

      const result = await response.json();

      if (result.status === "error") {
        toast.error(`Error: ${result.message}`);
      } else {
        toast.success(result.message);
        // Optionally, you can add logic here to update the UI after successful deletion
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("An unexpected error occurred.");
    } finally {
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
