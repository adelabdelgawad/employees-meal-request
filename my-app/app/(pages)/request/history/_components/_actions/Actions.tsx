"use client"
import React, { useState, useCallback } from "react";
import ViewAction from "./ViewAction";
import DeleteAction from "./DeleteAction";
import CopyAction from "./CopyAction";

interface ActionsProps {

  recordId: number;
  currentStatusId: number;

}

const Actions: React.FC<ActionsProps> = ({
  recordId,
  currentStatusId,
}) => {
  // If the current status is not 1, disable action buttons.
  const disableActions = currentStatusId !== 1 && currentStatusId !== 2;

  // State to control the confirmation dialog and the new status value.
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  const openConfirmDialog = useCallback((newStatusId: number) => {
    setSelectedStatusId(newStatusId);
    setConfirmDialogOpen(true);
  }, []);



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
    <div className="flex gap-2 items-center align-middle justify-center text-center">
      <CopyAction requestId={recordId} />

      <ViewAction
        id={recordId}
        disableStatus={disableActions}
      />
    
      <DeleteAction id={recordId} disableStatus={disableActions}/>

    </div>
  );
};

export default Actions;
