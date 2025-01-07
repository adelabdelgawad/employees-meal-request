import React from "react";
import ViewAction from "./ViewAction";
import RejectAction from "./RejectAction";
import AcceptAction from "./AcceptAction";

interface ActionsProps {
  rowId: number;
  requestStatusId: string;
}

export const Actions: React.FC<ActionsProps> = ({ rowId, requestStatusId }) => {
  // Disable the Accept button if requestStatusId is not "Pending"
  const disableStatus = requestStatusId !== "Pending";

  return (
    <div className="flex gap-2 items-center justify-center">
      {/* View Button */}
      <ViewAction id={rowId} disableStatus={disableStatus} />

      <RejectAction id={rowId} disableStatus={disableStatus} />

      <AcceptAction id={rowId} disableStatus={disableStatus} />
    </div>
  );
};
