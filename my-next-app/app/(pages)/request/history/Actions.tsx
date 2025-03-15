"use client";
import React, { useState } from "react";
import ViewAction from "./_actions/ViewAction";
import DeleteAction from "./_actions/DeleteRequest";
import CopyAction from "./_actions/CopyRequest";
import { KeyedMutator } from "swr";
import toast from "react-hot-toast";

interface ActionsProps {
  record: RequestRecord;
  mutate: KeyedMutator<RequestsResponse>;
}

const Actions: React.FC<ActionsProps> = ({ record, mutate }) => {
  const disabled: boolean = record.status_id !== 1 && record.status_id !== 2;

  return (
    <div className="flex gap-2 items-center align-middle justify-center text-center">
      <CopyAction mutate={mutate} record={record} />
      <ViewAction record={record} mutate={mutate} disabled={disabled} />
      <DeleteAction disabled={disabled} mutate={mutate} record={record} />
    </div>
  );
};

export default Actions;
