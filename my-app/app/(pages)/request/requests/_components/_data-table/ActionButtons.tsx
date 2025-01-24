import React, { useState, useTransition } from "react";
import ViewAction from "@/app/(pages)/request/requests/_components/ViewAction";
import { Check, X } from "lucide-react";
import { updateRequestStatus } from "@/pages/api/actions";
import { useAlerts } from "@/components/alert/useAlerts";
import ConfirmationModal from "@/components/data-table/ConfirmationDialog";
import { useRequest } from "@/hooks/RequestContext";

interface ActionsProps {
  recordId: number;
  requestStatusId: number;
}

export const ActionButtons: React.FC<ActionsProps> = ({
  recordId,
  requestStatusId,
}) => {
  const { addAlert } = useAlerts();
  const [isPending, startTransition] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(
    null
  );

  const { mutate } = useRequest();

  const disableStatus = requestStatusId !== 1;

  // Handle Accept/Reject with confirmation
  const handleConfirm = async () => {
    setShowConfirmModal(false);
    if (actionType === "accept") {
      handleAccept();
    } else if (actionType === "reject") {
      handleReject();
    }
  };

  const handleReject = () => {
    if (disableStatus) return;

    startTransition(async () => {
      try {
        const result = await updateRequestStatus(recordId, 4);
        addAlert(result.message, "success");
        await mutate({ id: recordId, status_id: 4, status_name: "Rejected" });
      } catch (error) {
        addAlert("Failed to update request status.", "error");
      }
    });
  };

  const handleAccept = () => {
    if (disableStatus) return;

    startTransition(async () => {
      try {
        const result = await updateRequestStatus(recordId, 3);
        addAlert(result.message, "success");
        await mutate({ id: recordId, status_id: 3, status_name: "Accepted" });
      } catch (error) {
        addAlert("Failed to update request status.", "error");
      }
    });
  };

  return (
    <div className="flex gap-2 items-center justify-center">
      <ViewAction id={recordId} disableStatus={disableStatus} />

      <div>
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            disableStatus || isPending
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-200 hover:bg-red-300 cursor-pointer"
          }`}
          onClick={() => {
            setActionType("reject");
            setShowConfirmModal(true);
          }}
          title="Reject"
        >
          <X width={20} height={20} />
        </button>
      </div>

      <div>
        <button
          disabled={disableStatus || isPending}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            disableStatus || isPending
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-200 hover:bg-green-300 cursor-pointer"
          }`}
          onClick={() => {
            setActionType("accept");
            setShowConfirmModal(true);
          }}
          title="Accept"
        >
          <Check width={20} height={20} />
        </button>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmModal(false)}
        title="Are you sure?"
        message={`Do you want to ${
          actionType === "accept" ? "accept" : "reject"
        } this request?`}
      />
    </div>
  );
};
