"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch"; // ShadCN Switch
import { Label } from "@/components/ui/label"; // ShadCN Label

const Counter: React.FC = () => {
  const router = useRouter();
  const [timer, setTimer] = useState(30);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    setTimer(30);
  }, []);

  useEffect(() => {
    if (isAutoRefresh && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }

    if (isAutoRefresh && timer === 0) {
      setTimer(30);
      router.refresh();
    }
  }, [timer, router, isAutoRefresh]);

  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 gap-2 rounded-lg border shadow-sm w-full max-w-md",
        "bg-green-100 border-green-500"
      )}
    >
      {/* Timer */}
      <span className="text-sm font-medium text-gray-700">
        <span className="font-bold text-red-500">{timer}s</span>
      </span>

      {/* Refresh Button */}
      <span>
        <RefreshCw className="w-5 h-5 text-gray-600" />
      </span>

      {/* Auto-Refresh Toggle */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-gray-700">
          Auto Refresh
        </Label>
        <Switch
          checked={isAutoRefresh}
          onCheckedChange={() => setIsAutoRefresh(!isAutoRefresh)}
        />
      </div>
    </div>
  );
};

export default Counter;
