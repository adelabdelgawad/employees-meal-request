// Actions.tsx
"use client";

import React from 'react';
import ApproveButton from './ApproveButton';
import RejectButton from './RejectButton';
import ViewAction from './ViewAction';
import { KeyedMutator } from 'swr';

interface ActionsProps {
  record: RequestRecord;
  mutate: KeyedMutator<RequestRecord>;
}

const Actions: React.FC<ActionsProps> = ({ record, mutate }) => {
  // Disable buttons if the record is not in pending status (status_id !== 1)
  const isDisabled = record.status_id !== 1;

  return (
    <div className="flex gap-2 items-center justify-center text-center">
      <RejectButton  disabled={isDisabled} mutate={mutate} record={record} />
      <ApproveButton disabled={isDisabled} mutate={mutate} record={record} />
      <ViewAction disabled={isDisabled} mutate={mutate} record={record} />
    </div>
  );
};

export default Actions;
