
// RejectButton.tsx
import React from 'react';
import { X } from 'lucide-react';

interface RejectButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const RejectButton: React.FC<RejectButtonProps> = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 flex items-center justify-center rounded-full ${
      disabled
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-red-200 cursor-pointer hover:brightness-105'
    }`}
    disabled={disabled}
  >
    <X size={24} />
  </button>
);

export default RejectButton;
