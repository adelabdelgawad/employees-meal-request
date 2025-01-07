import React from "react";
import { CheckIcon } from "@radix-ui/react-icons";

interface AcceptActionProps {
  id: number;
  disableStatus: boolean;
}

const AcceptAction: React.FC<AcceptActionProps> = ({ id, disableStatus }) => {
  const handleAccept = (id: number) => {
    console.log(`View button clicked for row ${id}`);
  };

  return (
    <div>
      {/* Accept Button */}
      <button
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          disableStatus
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-green-200 hover:bg-green-300 cursor-pointer"
        }`}
        onClick={() => handleAccept(id)}
        title="Accept"
      >
        <CheckIcon width={20} height={20} />
      </button>
    </div>
  );
};

export default AcceptAction;
