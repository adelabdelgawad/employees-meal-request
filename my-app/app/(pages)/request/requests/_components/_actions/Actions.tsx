import React, { useState, useCallback } from "react";
import ViewAction from "./ViewAction";
import { Check, X } from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import DeleteAction from "./DeleteAction";

interface ActionsProps {
  handleAction: (id: number, newStatusId: number) => Promise<void>;
  handleRequestLinesChanges: (id: number, updatedRecord: any) => Promise<void>;
  recordId: number;
  currentStatusId: number;
  isAdmin: boolean;
  isTheRequester: boolean;
}

const Actions: React.FC<ActionsProps> = ({
  handleAction,
  handleRequestLinesChanges,
  recordId,
  currentStatusId,
  isAdmin,
  isTheRequester,
}) => {
  // If the current status is not 1, disable action buttons.
  const disableActions = currentStatusId !== 1;

  // State to control the confirmation dialog and the new status value.
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
        console.error(`Failed to update status to ${selectedStatusId} for record ${recordId}:`, error);
      } finally {
        closeConfirmDialog();
      }
    }
  }, [handleAction, recordId, selectedStatusId, closeConfirmDialog]);

  // Component for rendering an action button with an icon.
  const ActionButton: React.FC<{
    newStatusId: number;
    Icon: React.ElementType;
    buttonColor: string;
  }> = ({ newStatusId, Icon, buttonColor }) => (
    <button
      onClick={() => openConfirmDialog(newStatusId)}
      className={`w-10 h-10 flex items-center justify-center rounded-full ${
        disableActions
          ? "bg-gray-300 cursor-not-allowed"
          : `${buttonColor} cursor-pointer hover:brightness-105`
      }`}
      disabled={disableActions}
    >
      <Icon size={24} />
    </button>
  );

  return (
    <div className="flex gap-2 items-center justify-center">
      <ViewAction
        handleRequestLinesChanges={handleRequestLinesChanges}
        id={recordId}
        disableStatus={disableActions}
      />

      {isAdmin && (
        <>
          <ActionButton newStatusId={4} Icon={X} buttonColor="bg-red-200" />
          <ActionButton newStatusId={3} Icon={Check} buttonColor="bg-green-200" />
        </>
      )}

    
      <DeleteAction id={recordId} disableStatus={disableActions} isTheRequester={isTheRequester}/>

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
