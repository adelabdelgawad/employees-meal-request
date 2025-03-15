"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Eye } from "lucide-react";
import RequestLinesSheet from "../RequestLinesSheet";
import { KeyedMutator } from "swr";
import { deleteHistoryRequestLines } from "@/app/actions/request-history";

interface ViewActionProps {
  record: RequestRecord;
  disabled: boolean;
  mutate: KeyedMutator<RequestsResponse>;
}

const ViewAction: React.FC<ViewActionProps> = ({ record, mutate, disabled }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSave = async (deletedRequestLines: RequestLine[]): Promise<void> => {
    try {
      console.log("Deleted Request Lines:", deletedRequestLines);

      // Call the server action to send deleted lines to FastAPI
      const data = await deleteHistoryRequestLines(deletedRequestLines);
      console.log(data)
      
      // Refresh the data
      await mutate();      toast.success("Changes saved. Check console for deleted items.");
    } catch (error) {
      console.error("Error during save:", error);
      toast.error("Failed to save changes.");
    }
  };
  
  return (
    <>
      <Button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-black"
        onClick={() => setIsSheetOpen(true)}
        title="View"
      >
        <Eye className="w-5 h-5" />
      </Button>

      {isSheetOpen && (
        <RequestLinesSheet
          disabled={disabled}
          record={record}
          onSave={handleSave}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </>
  );
};

export default ViewAction;
