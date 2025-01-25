import React from "react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/confirmation-dialog";

interface SaveButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  isSubmitting,
  onClick,
}) => {
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setShowConfirmModal(true)}
        disabled={isSubmitting}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Save"
        message="Are you sure you want to save these changes?"
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          onClick();
          setShowConfirmModal(false);
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};
