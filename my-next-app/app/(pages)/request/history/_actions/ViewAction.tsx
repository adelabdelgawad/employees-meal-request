"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Eye } from "lucide-react";
import RequestLinesSheet from "./RequestLinesSheet";


interface ViewAcionProps {
  record: RequestRecord;
  disabled: boolean;
}

const ViewAction: React.FC<ViewAcionProps> = ({ record, disabled }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  const handleSave = (deletedRequestLine: RequestLine[]) => {
    console.log("Deleted Request Lines:", deletedRequestLine);
    toast.success("Changes saved. Check console for deleted items.");
  };

  return (
    <div 
    className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-black"
    >
      <Button onClick={() => setIsSheetOpen(true)}><Eye className="w-5 h-5" /></Button>
      {isSheetOpen && (
        <RequestLinesSheet
        disabled={disabled}
        record={record}
        onSave={handleSave}
        onClose={() => setIsSheetOpen(false)}
        />
      )}
    </div>
  );
}
export default ViewAction;
