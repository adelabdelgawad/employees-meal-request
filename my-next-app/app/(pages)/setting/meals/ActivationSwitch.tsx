"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface ActivationSwitchProps {
  isActive: boolean;
  onChange: (newState: boolean) => void;
}

const ActivationSwitch: React.FC<ActivationSwitchProps> = ({ isActive, onChange }) => {
  const [active, setActive] = useState(isActive);

  const handleToggle = () => {
    const newValue = !active;
    setActive(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex items-center space-x-2">
      <span>{active ? "Active" : "Inactive"}</span>
      <Switch checked={active} onCheckedChange={handleToggle} />
    </div>
  );
};

export default ActivationSwitch;
