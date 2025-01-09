import React, { useState, useTransition } from "react";
import ViewAction from "../ViewAction";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { updateRequestStatus } from "@/pages/api/actions";
import { useDataTable } from "@/app/(pages)/request/requests/_components/_data-table/DataTableContext";
import { useAlerts } from "@/components/alert/useAlerts";
import ConfirmationModal from "./ConfirmationDialog";

interface ActionsProps {
  rowId: number;
  requestStatusId: number;
}

export const ActionButtons: React.FC<ActionsProps> = ({
  rowId,
  requestStatusId,
}) => {
  const { addAlert } = useAlerts();
  const [isPending, startTransition] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(
    null
  );

  const { mutate } = useDataTable();

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
        const result = await updateRequestStatus(rowId, 4);
        addAlert(result.message, "success");
        await mutate();
      } catch (error) {
        addAlert("Failed to update request status.", "error");
      }
    });
  };

  const handleAccept = () => {
    if (disableStatus) return;

    startTransition(async () => {
      try {
        const result = await updateRequestStatus(rowId, 3);
        addAlert(result.message, "success");
        await mutate();
      } catch (error) {
        addAlert("Failed to update request status.", "error");
      }
    });
  };

  return (
    <div className="flex gap-2 items-center justify-center">
      <ViewAction id={rowId} disableStatus={disableStatus} />

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
          <Cross2Icon width={20} height={20} />
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
          <CheckIcon width={20} height={20} />
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
