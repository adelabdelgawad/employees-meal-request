import React from "react";
import { CheckIcon } from "@radix-ui/react-icons";
import { useState, useTransition } from "react";
import { updateRequestStatus } from "../../actions";

interface AcceptActionProps {
  requestId: number;
  disableStatus: boolean;
  onStatusChange: (newStatusName: string) => void; // Callback to update parent state
}

const AcceptAction: React.FC<AcceptActionProps> = ({
  requestId,
  disableStatus,
  onStatusChange,
}) => {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleAccept = () => {
    if (disableStatus) return;

    startTransition(async () => {
      try {
        const result = await updateRequestStatus(requestId, 3);
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
      <button
        disabled={disableStatus || isPending}
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          disableStatus || isPending
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-green-200 hover:bg-green-300 cursor-pointer"
        }`}
        onClick={handleAccept}
        title="Accept"
      >
        <CheckIcon width={20} height={20} />
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
};

export default AcceptAction;
