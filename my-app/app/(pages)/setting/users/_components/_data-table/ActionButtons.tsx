import { useState } from "react";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { TrashIcon } from "lucide-react";
import { EditAction } from "./EditAction";
import { toast } from "react-hot-toast";
interface ActionButtonsProps {
  recordId: number;
}

export default function ActionButtons({ recordId }: ActionButtonsProps) {
  // State for managing confirmation dialog visibility
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Delete action handler
  const handleDelete = async () => {
    try {
      toast.success("Record deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete the record");
    }
  };

  return (
    <div className="flex space-x-2 items-center">
      {/* Edit Button */}
      <EditAction userId={recordId} />
      {/* Delete Button */}
      <Button
        onClick={() => setDeleteDialogOpen(true)}
        variant="outline"
        color="red"
      >
        <TrashIcon className="mr-1" /> Delete
      </Button>

      {/* Confirmation Dialog for Delete Action */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Record"
        message={`Are you sure you want to delete record #${recordId}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          handleDelete();
          setDeleteDialogOpen(false);
        }}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
