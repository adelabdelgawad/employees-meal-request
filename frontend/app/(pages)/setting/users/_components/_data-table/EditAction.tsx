'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { EditUserDialog } from '../EditUserDialog';

interface EditActionProps {
  userId: number;
}

export function EditAction({ userId }: EditActionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        <Pencil1Icon className="mr-1" /> Edit
      </Button>
      <EditUserDialog
        userId={userId}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
