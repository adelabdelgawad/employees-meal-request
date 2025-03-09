// ApproveButton.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface ApproveButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const ApproveButton: React.FC<ApproveButtonProps> = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 flex items-center justify-center rounded-full ${
      disabled
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-green-200 cursor-pointer hover:brightness-105'
    }`}
    disabled={disabled}
  >
    <Check size={24} />
  </button>
);

export default ApproveButton;
