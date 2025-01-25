import React from "react";
import { Switch } from "@/components/ui/switch";

interface SwitchButtonProps {
  lineId: number;
  checked: boolean;
  disableStatus: boolean;
  onSwitchChange: (lineId: number, checked: boolean) => void;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  lineId,
  checked,
  disableStatus,
  onSwitchChange,
}) => {
  return (
    <Switch
      checked={checked}
      onCheckedChange={(checked) => onSwitchChange(lineId, checked)}
      disabled={disableStatus}
    />
  );
};

export default SwitchButton;
