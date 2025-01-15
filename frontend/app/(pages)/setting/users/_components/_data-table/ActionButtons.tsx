import { useState } from 'react';
import { useAlerts } from '@/components/alert/useAlerts';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/data-table/ConfirmationDialog';
import ActionEdit from './ActionEdit';
import { useSettingUserContext } from '@/hooks/SettingUserContext';

interface ActionButtonsProps {
  recordId: number;
}

export default function ActionButtons({ recordId }: ActionButtonsProps) {
  const { addAlert } = useAlerts();

  // State for managing confirmation dialog visibility
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Delete action handler
  const handleDelete = async () => {
    try {
      addAlert('Record deleted successfully!', 'success');
    } catch (error) {
      addAlert('Failed to delete the record', 'error');
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
