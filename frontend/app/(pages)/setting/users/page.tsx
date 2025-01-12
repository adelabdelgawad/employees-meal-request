'use client';

import { AddUserDialog } from './_components/AddUserDialog';

export default function AddUserPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-end">
        <AddUserDialog />
      </div>
    </div>
  );
}
