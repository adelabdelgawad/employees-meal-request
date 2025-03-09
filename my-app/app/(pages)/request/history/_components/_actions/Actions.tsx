"use client"
import React from "react";
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