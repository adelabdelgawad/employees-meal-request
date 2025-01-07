import React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";

interface RejectActionProps {
  id: number;
  disableStatus: boolean;
}

const RejectAction: React.FC<RejectActionProps> = ({ id, disableStatus }) => {
  const handleReject = (id: number) => {
    console.log(`View button clicked for row ${id}`);
  };

  return (
    <div>
      {/* Reject Button */}
      <button
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          disableStatus
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-red-200 hover:bg-red-300 cursor-pointer"
        }`}
        onClick={() => handleReject(id)}
        title="Reject"
      >
        <Cross2Icon width={20} height={20} />
      </button>
    </div>
  );
};

export default RejectAction;
