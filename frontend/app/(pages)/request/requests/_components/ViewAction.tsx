import React, { useState } from "react";
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
import { EyeOpenIcon } from "@radix-ui/react-icons";
import DialogTable from "./_request-lines/DialogTable";
import { updateRequestLines } from "@/lib/data-fetcher";
import { useAlerts } from "@/components/alert/useAlerts";
import ConfirmationModal from "./_data-table/ConfirmationDialog";
// Import the ConfirmationModal

interface ViewActionProps {
  id: number;
  disableStatus: boolean;
}

const ViewAction: React.FC<ViewActionProps> = ({ id, disableStatus }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [changedStatus, setChangedStatus] = useState<
    { id: number; is_accepted: boolean }[]
  >([]);
  const { addAlert } = useAlerts();

  // For "Are you sure?" modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/request-lines?request_id=${id}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch requests");
      }

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
  };

  // Handle dialog open/close
  const handleDialogChange = (isOpen: boolean) => {
    if (isOpen) {
      fetchData();
      setChangedStatus([]);
    }
    setOpen(isOpen);
  };

  /**
   * Actual API call to save changes
   * Called ONLY if user confirms the action in the confirmation modal.
   */
  const confirmSave = async () => {
    // Hide the confirmation modal
    setShowConfirmModal(false);

    if (changedStatus.length > 0) {
      try {
        // Call the API to update the request lines
        const message = await updateRequestLines(changedStatus);
        setOpen(false); // Close the main dialog on success
        addAlert(message, "success");
      } catch (error) {
        addAlert("Error saving changes. Please try again.", "error");
      }
    } else {
      addAlert("No changes made.", "warning");
      setOpen(false); // Close the main dialog if no changes were made
    }
  };

  /**
   * Prompt user to confirm before saving
   */
  const handleSaveClick = () => {
    // Show the confirmation modal
    setShowConfirmModal(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-black"
            title="View"
            onClick={() => handleDialogChange(true)}
            disabled={loading}
          >
            {loading ? "Loading..." : <EyeOpenIcon width={20} height={20} />}
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
            {/* Instead of calling handleSave directly, we open the confirmation modal first */}
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

      {/* Confirmation modal for saving changes */}
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
