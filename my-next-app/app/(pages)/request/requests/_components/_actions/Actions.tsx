"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ViewAction from './ViewAction';
import ConfirmationDialog from '@/components/confirmation-dialog';
import ApproveButton from './ApproveButton';
import RejectButton from './RejectButton';
import { getSession } from '@/lib/session';

interface ActionsProps {
  handleAction: (id: number, newStatusId: number) => Promise<void>;
  handleRequestLinesChanges: (recordId: number, updatedRecord: Partial<Request>) => Promise<void>;
  recordId: number;
  currentStatusId: number;
}

const Actions: React.FC<ActionsProps> = ({
  handleAction,
  handleRequestLinesChanges,
  recordId,
  currentStatusId,
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  // Disable actions if the current status is not 1
  const disableActions = currentStatusId !== 1;

  useEffect(() => {
    const fetchSession = async () => {
      const session: Session | null = await getSession();
      // Assuming session.user.roles is an array of strings
      const userRoles: string[] = session?.user?.roles || [];
      console.log("userRoles", userRoles);

      // Compare roles directly since they are strings
      const isAdminUser = userRoles.some(role => role === "Admin");
      setIsAdmin(isAdminUser);
    };

    fetchSession();
  }, []);

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
