import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  const params = new URLSearchParams(searchParams?.toString() || "");

  const handleChange = (newValue: boolean) => {
    // Update local state
    setValue(newValue);

    // Update URL parameters
    if (newValue) {
      params.set(paramName, newValue.toString());
    } else {
      params.delete(paramName);
    }
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
