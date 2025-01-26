import React, { useState, useCallback } from "react";
import ViewAction from "./ViewAction";
import { Check, X } from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import toast from "react-hot-toast";

interface ActionsProps {
  handleAction: (id: number, statusId: number) => Promise<void>;
  handleRequestLinesChanges: (id: number, updatedRecord: any) => Promise<void>;
  recordId: number;
  currentStatusId: number;
}

const Actions: React.FC<ActionsProps> = ({
  handleRequestLinesChanges,
  handleAction,
  recordId,
  currentStatusId,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [statusToChange, setStatusToChange] = useState<number | null>(null);

  const isActionDisabled = currentStatusId !== 1;

  const openConfirmationDialog = useCallback((statusId: number) => {
    setStatusToChange(statusId);
    setShowDialog(true);
  }, []);

  const closeConfirmationDialog = useCallback(() => {
    setShowDialog(false);
    setStatusToChange(null);
  }, []);

  const handleAsyncAction = useCallback(async () => {
    if (statusToChange !== null) {
      try {
        await handleAction(recordId, statusToChange);
        toast.success("Action completed successfully!");
      } catch (error) {
        console.error(
          `Failed to handle action for statusId ${statusToChange}:`,
          error
        );
      } finally {
        closeConfirmationDialog();

      }
    }
  }, [handleAction, recordId, statusToChange, closeConfirmationDialog]);

  const renderActionButton = (
    statusId: number,
    Icon: React.ElementType,
    colorClasses: string
  ) => (
    <button
      onClick={() => openConfirmationDialog(statusId)}
      className={`w-10 h-10 flex items-center justify-center rounded-full ${
        isActionDisabled
          ? "bg-gray-300 cursor-not-allowed"
          : `${colorClasses} cursor-pointer hover:brightness-105`
      }`}
      disabled={isActionDisabled}
    >
      <Icon size={24} />
    </button>
  );

  return (
    <div className="flex gap-2 items-center justify-center">
      <ViewAction
        handleRequestLinesChanges={handleRequestLinesChanges}
        id={recordId}
        disableStatus={false}
      />

      {/* Action Buttons */}
      {renderActionButton(4, X, "bg-red-200")}
      {renderActionButton(3, Check, "bg-green-200")}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDialog}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action?"
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={handleAsyncAction}
        onCancel={closeConfirmationDialog}
      />
    </div>
  );
};

export default Actions;
