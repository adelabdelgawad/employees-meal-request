import React, { useState, useCallback } from 'react';
import ViewAction from './ViewAction';
import ConfirmationDialog from '@/components/confirmation-dialog';
import ApproveButton from './ApproveButton';
import RejectButton from './RejectButton';

interface ActionsProps {
  handleAction: (id: number, newStatusId: number) => Promise<void>;
  handleRequestLinesChanges: (recordId: number, updatedRecord: Partial<Request>) => Promise<void>;
  recordId: number;
  currentStatusId: number;
  isAdmin: boolean;
}
const Actions: React.FC<ActionsProps> = ({
  handleAction,
  handleRequestLinesChanges,
  recordId,
  currentStatusId,
  isAdmin,
}) => {
  const disableActions = currentStatusId !== 1;

  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  const openConfirmDialog = useCallback((newStatusId: number) => {
    setSelectedStatusId(newStatusId);
    setConfirmDialogOpen(true);
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialogOpen(false);
    setSelectedStatusId(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (selectedStatusId !== null) {
      try {
        await handleAction(recordId, selectedStatusId);
      } catch (error) {
        console.error(
          `Failed to update status to ${selectedStatusId} for record ${recordId}:`,
          error
        );
      } finally {
        closeConfirmDialog();
      }
    }
  }, [handleAction, recordId, selectedStatusId, closeConfirmDialog]);

  return (
    <div className="flex gap-2 items-center justify-center text-center">
      <ViewAction
        handleRequestLinesChanges={handleRequestLinesChanges}
        id={recordId}
        disableStatus={disableActions}
      />

      {isAdmin && (
        <>
          <RejectButton
            onClick={() => openConfirmDialog(4)}
            disabled={disableActions}
          />
          <ApproveButton
            onClick={() => openConfirmDialog(3)}
            disabled={disableActions}
          />
        </>
      )}

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action?"
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmDialog}
      />
    </div>
  );
};

export default Actions;
