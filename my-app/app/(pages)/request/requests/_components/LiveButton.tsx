"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LiveButton: React.FC = () => {
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Extract all current search parameters
  const params = new URLSearchParams(searchParams.toString());
  const isLiveParam = params.get("live") === "true";

  // Remove 'live' parameter temporarily to check for other existing params
  if (isLiveParam) params.delete("live");
  const hasOtherQueryParams = Array.from(params.keys()).length > 0;

  // State for managing the Live mode
  const [isLive, setIsLive] = useState(isLiveParam);

  useEffect(() => {
    if (!isLiveParam) {
      setIsLive(false);
    }
  }, [isLiveParam]);

  // Update the URL when toggling Live mode
  const updateUrl = (live: boolean) => {
    const newParams = new URLSearchParams(params.toString());
    if (live) {
      newParams.set("live", "true");
    } else {
      newParams.delete("live");
    }

    const queryString = newParams.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname || "";
    router.replace(newUrl);
  };

  // Handle toggle switch
  const handleToggle = () => {
    if (hasOtherQueryParams) return; // Prevent toggling if there are other params

    const newLiveState = !isLive;
    setIsLive(newLiveState);
    updateUrl(newLiveState);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg min-w-[120px] h-12 border shadow-sm",
        isLive ? "bg-green-100 border-green-500" : "bg-white border-gray-300"
      )}
    >
      <Badge variant={isLive ? "default" : "secondary"}>
        {isLive ? "Live" : "Offline"}
      </Badge>
      <Switch
        checked={isLive}
        onCheckedChange={handleToggle}
        disabled={hasOtherQueryParams}
      />
    </div>
  );
};

export default LiveButton;
