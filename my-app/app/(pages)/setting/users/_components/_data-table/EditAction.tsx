"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditUserDialog } from "../EditUserDialog";
import { PencilIcon } from "lucide-react";

interface EditActionProps {
  userId: number;
}

export function EditAction({ userId }: EditActionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        <PencilIcon className="mr-1" /> Edit
      </Button>
      <EditUserDialog
        userId={userId}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
