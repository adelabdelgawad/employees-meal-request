import React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState, useTransition } from "react";
import { updateRequestStatus } from "../../actions";

interface RejectActionProps {
  requestId: number;
  disableStatus: boolean;
  onStatusChange: (newStatusName: string) => void; // Callback to update parent state
}
const RejectAction: React.FC<RejectActionProps> = ({
  requestId,
  disableStatus,
  onStatusChange,
}) => {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleReject = () => {
    if (disableStatus) return;

    startTransition(async () => {
      try {
        const result = await updateRequestStatus(requestId, 4);
        setMessage(result.message);

        // Optimistically update the status in the parent component
        onStatusChange(String(3));
      } catch (error) {
        setMessage("Failed to update request status.");
      }
    });
  };

  return (
    <div>
      {/* Reject Button */}
      <button
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          disableStatus || isPending
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-red-200 hover:bg-red-300 cursor-pointer"
        }`}
        onClick={handleReject}
        title="Reject"
      >
        <Cross2Icon width={20} height={20} />
      </button>
    </div>
  );
};

export default RejectAction;
