import React, { useState } from "react";
import ViewAction from "./ViewAction";
import RejectAction from "./RejectAction";
import AcceptAction from "./AcceptAction";

interface ActionsProps {
  rowId: number;
  requestStatusId: number;
}

export const Actions: React.FC<ActionsProps> = ({
  rowId,
  requestStatusId
}) => {
  
  // Use initial state from props
  const [stausId, setStatusId] = useState<number>(requestStatusId);

  // Disable the Accept/Reject buttons if the request is not "Pending"
  const disableStatus = stausId !== 1;

  return (
    <div className="flex gap-2 items-center justify-center">
      {/* View Button */}
      <ViewAction id={rowId} disableStatus={disableStatus} />

      {/* Reject Button */}
      <RejectAction
        requestId={rowId}
        disableStatus={disableStatus}
        onStatusChange={setStatusId} // Pass the state setter to update status
      />

      {/* Accept Button */}
      <AcceptAction
        requestId={rowId}
        disableStatus={disableStatus}
        onStatusChange={setStatusId} // Pass the state setter to update status
      />
    </div>
  );
};
