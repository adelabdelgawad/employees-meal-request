"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner"; // Import ShadCN Spinner

interface URLSwitchProps {
  placeholder: string;
}

export function URLSwitch({ placeholder }: URLSwitchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Track loading state

  // Effect to update the switch state based on URL changes
  useEffect(() => {
    const hasStartDate = searchParams?.get("startDate");
    const hasEndDate = searchParams?.get("endDate");
    const updateAttendanceParam = searchParams?.get("updateAttendance");

    // If both start and end dates exist, enable the switch
    setIsDisabled(!(hasStartDate && hasEndDate));

    // Reset to false on any URL change unless updateAttendance=true
    if (updateAttendanceParam === "true") {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [pathname, searchParams]); // Track changes in pathname and searchParams

  // Track when the URL parameter actually updates to "true"
  useEffect(() => {
    if (isLoading && searchParams?.get("updateAttendance") === "true") {
      setIsLoading(false); // Stop loading when the URL updates
    }
  }, [searchParams, isLoading]);

  const handleChange = (newValue: boolean) => {
    setIsChecked(newValue);
    if (newValue) {
      setIsLoading(true); // Show spinner when enabling
    }

    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", "1");

    if (newValue) {
      params.set("updateAttendance", "true");
    } else {
      params.delete("updateAttendance");
    }

    router.replace(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 my-4">
      <div className="relative flex items-center">
        {isLoading && <Spinner className="absolute left-[-30px] h-5 w-5 text-blue-500" />}
        <Switch
          id="url-switch"
          checked={isChecked}
          onCheckedChange={handleChange}
          disabled={isDisabled || isLoading}
          className={isDisabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
        />
      </div>
      <Label htmlFor="url-switch">{placeholder}</Label>
    </div>
  );
}
