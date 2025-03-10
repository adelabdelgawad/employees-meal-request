"use client"
import React from "react";
import ViewAction from "./ViewAction";
import DeleteAction from "./DeleteAction";
import CopyAction from "./CopyAction";
import { HistoryRequest } from "../HistoryDataTable";

interface ActionsProps {
  recordId: number;
  currentStatusId: number;
  setData: React.Dispatch<React.SetStateAction<HistoryRequest[]>>; // 🛑 Add setData prop
}


const Actions: React.FC<ActionsProps> = ({ recordId, currentStatusId, setData }) => {
  // If the current status is not 1, disable action buttons.
  const disableActions = currentStatusId !== 1 && currentStatusId !== 2;


  return (
    <div className="flex gap-2 items-center align-middle justify-center text-center">
      <CopyAction requestId={recordId} setData={setData} />
      <ViewAction id={recordId} disableStatus={disableActions} />
      <DeleteAction id={recordId} disableStatus={disableActions} setData={setData} />
    </div>
  );
};

export default Actions;