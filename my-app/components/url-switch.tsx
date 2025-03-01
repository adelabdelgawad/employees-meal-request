import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface URLSwitchProps {
  placeholder: string;
  value: boolean;
  setValue: (value: boolean) => void;
  paramName: string;
  className?: string;
}

export function URLSwitch({
  placeholder,
  value,
  setValue,
  paramName,
  className,
}: URLSwitchProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleChange = (newValue: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (newValue) {
      // Validate that both "start_time" and "end_time" exist before toggling on.
      if (!params.has("start_time")) {
        toast.error("Please Pick a Request date range ");
        return;
      }
      if (!params.has("end_time")) {
        toast.error("Select a valid EndTime");
        return;
      }
      // Set the toggle parameter.
      params.set(paramName, newValue.toString());
    } else {
      // When turning off, remove the toggle and time parameters.
      params.delete(paramName);
      params.delete("start_time");
      params.delete("end_time");
    }

    // Update local state and URL.
    setValue(newValue);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch id="url-switch" checked={value} onCheckedChange={handleChange} />
      <label
        htmlFor="url-switch"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {placeholder}
      </label>
    </div>
  );
}
