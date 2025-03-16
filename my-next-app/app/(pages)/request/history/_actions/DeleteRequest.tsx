
import React, { useState, useCallback } from "react";
import { Trash } from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import toast from "react-hot-toast";
import clientAxiosInstance from "@/lib/clientAxiosInstance";
import { KeyedMutator } from "swr";


interface DeleteRequestProps {
  disabled: boolean;
  mutate: KeyedMutator<RequestsResponse>;
  record: RequestRecord;
}

const DeleteRequest: React.FC<DeleteRequestProps> = ({ disabled, mutate, record }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      await clientAxiosInstance.delete(`/history/delete/${record.id}`);
      toast.success("Request Deleted Successfully");

      // Update the UI by removing the deleted record from the SWR data.
      mutate(
        (currentData: RequestsResponse | undefined) => {
          if (!currentData) {
            return {
              data: [],
              current_page: 1,
              page_size: 0,
              total_pages: 0,
              total_rows: 0,
            };
          }
          return {
            ...currentData,
            data: currentData.data.filter((req) => req.id !== record.id),
          };
        },
        false // do not revalidate immediately
      );
    } catch (error) {
      toast.error("Failed to delete the request.");
      console.error("Error deleting request:", error);
    } finally {
      closeDialog();
    }
  }, [record.id, mutate, closeDialog]);

  return (
    <>
      <button
        onClick={openDialog}
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-red-500 text-white cursor-pointer hover:bg-red-600"
        }`}
        disabled={disabled}
      >
        <Trash size={20} />
      </button>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item?"
        onConfirm={handleDelete}
        onCancel={closeDialog}
      />
    </>
  );
};

export default DeleteRequest;
