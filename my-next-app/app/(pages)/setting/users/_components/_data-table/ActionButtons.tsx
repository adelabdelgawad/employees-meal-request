import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ActionEdit from './ActionEdit';
import toast from 'react-hot-toast';
import { TrashIcon } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import clientAxiosInstance from '@/lib/clientAxiosInstance';

interface ActionButtonsProps {
  recordId: number;
  onDelete?: (id: number) => void; // Optional callback to update UI after deletion
}

export default function ActionButtons({ recordId, onDelete }: ActionButtonsProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete action

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await clientAxiosInstance.delete(`/users/${recordId}`);
      if (response.status === 204) {
        toast.success('Record deleted successfully!');
                // Notify parent component to remove item from the UI
        if (onDelete) {
          onDelete(recordId);
        }

        setDeleteDialogOpen(false);
      }
    } catch (error) {
      if (error) {
        console.log(error)
        toast.error(`Faild to delete`);
      } else {
        toast.error('Failed to delete the record. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex space-x-2 items-center">
      {/* Edit Button */}
      <ActionEdit userId={recordId} />

      {/* Delete Button */}
      <Button
        onClick={() => setDeleteDialogOpen(true)}
        variant="outline"
        color="red"
        disabled={isDeleting} // Disable button while deleting
      >
        {isDeleting ? 'Deleting...' : <><TrashIcon className="mr-1" /> Delete</>}
      </Button>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Record"
        message={`Are you sure you want to delete record #${recordId}? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        // Disable buttons while deleting
      />
    </div>
  );
}
