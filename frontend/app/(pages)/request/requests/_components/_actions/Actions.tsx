import React, { useState } from "react";
import ViewAction from "./ViewAction";
import RejectAction from "./RejectAction";
import AcceptAction from "./AcceptAction";

interface ActionsProps {
  rowId: number;
  requestStatusName: string;
}

export const Actions: React.FC<ActionsProps> = ({
  rowId,
  requestStatusName,
}) => {
  // Use initial state from props
  const [statusName, setStatusName] = useState<string>(requestStatusName);
  console.log(requestStatusName);
  // Disable the Accept/Reject buttons if the request is not "Pending"
  const disableStatus = statusName !== "Pending";

  return (
    <div className="flex gap-2 items-center justify-center">
      {/* View Button */}
      <ViewAction id={rowId} disableStatus={disableStatus} />

      {/* Reject Button */}
      <RejectAction
        requestId={rowId}
        disableStatus={disableStatus}
        onStatusChange={setStatusName} // Pass the state setter to update status
      />

      {/* Accept Button */}
      <AcceptAction
        requestId={rowId}
        disableStatus={disableStatus}
        onStatusChange={setStatusName} // Pass the state setter to update status
      />
    </div>
  );
};
