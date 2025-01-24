"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import DialogTable from "./_request-lines/DialogTable";
import { useAlerts } from "@/components/alert/useAlerts";
import ConfirmationModal from "@/components/confirmation-dialog";
import { updateRequestLines } from "@/lib/services/request-lines";

interface ViewActionProps {
  id?: number;
  disableStatus: boolean;
  handleRequestLinesChanges: (id: number, updatedRecord: any) => Promise<void>;
}

const ViewAction: React.FC<ViewActionProps> = ({
  id,
  disableStatus,
  handleRequestLinesChanges,
}) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [changedStatus, setChangedStatus] = useState<
    { id: number; is_accepted: boolean }[]
  >([]);
  const { addAlert } = useAlerts();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/request-lines?request_id=${id}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Failed to fetch requests");

      const result = await res.json();
      if (result.length === 0) {
        console.error("No data found.");
        return;
      }

      setData(result);
      setOriginalData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDialogChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        fetchData();
        setChangedStatus([]);
      }
      setOpen(isOpen);
    },
    [fetchData]
  );

  const confirmSave = useCallback(async () => {
    setShowConfirmModal(false);

    if (changedStatus.length > 0) {
      try {
        // Payload with changed statuses
        console.log(changedStatus);
        const payload = {
          request_id: id, // Include request_id in the payload
          changed_statuses: changedStatus,
        };

        // Sending the PUT request with request_id as a query parameter
        const response = await fetch(
          `http://localhost:8000/update-request-lines`, // Pass request_id in query
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), // Serialize changed statuses
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || "Failed to update request lines."
          );
        }

        const result = await response.json();
        // Use the updated data returned by the API
        await handleRequestLinesChanges(id!, result.data);

        addAlert("Request lines updated successfully.", "success");
        setOpen(false);
      } catch (error) {
        console.error("Error saving changes:", error);
        addAlert("Error saving changes. Please try again.", "error");
      }
    } else {
      addAlert("No changes made.", "warning");
      setOpen(false);
    }
  }, [changedStatus, id, handleRequestLinesChanges, addAlert]);

  const handleSaveClick = () => setShowConfirmModal(true);

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-black"
            title="View"
            disabled={loading}
          >
            {loading ? "Loading..." : <Eye width={20} height={20} />}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[75vh] max-w-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>View Row Details</DialogTitle>
            <DialogDescription>
              You are viewing details for row ID: {id}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto border-t border-b border-gray-300 my-2">
            <DialogTable
              data={data}
              disableStatus={disableStatus}
              onSwitchChange={(lineId, checked) => {
                setData((prevData) =>
                  prevData.map((line) =>
                    line.id === lineId
                      ? { ...line, is_accepted: checked }
                      : line
                  )
                );

                const originalLine = originalData.find(
                  (line) => line.id === lineId
                );
                if (!originalLine) return;

                setChangedStatus((prevChanged) => {
                  if (originalLine.is_accepted !== checked) {
                    const existingChange = prevChanged.find(
                      (item) => item.id === lineId
                    );
                    if (existingChange) {
                      return prevChanged.map((item) =>
                        item.id === lineId
                          ? { id: lineId, is_accepted: checked }
                          : item
                      );
                    } else {
                      return [
                        ...prevChanged,
                        { id: lineId, is_accepted: checked },
                      ];
                    }
                  } else {
                    return prevChanged.filter((item) => item.id !== lineId);
                  }
                });
              }}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveClick}
              disabled={disableStatus || changedStatus.length === 0}
            >
              Save
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Save"
        message="Are you sure you want to save these changes?"
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={confirmSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};

export default ViewAction;
