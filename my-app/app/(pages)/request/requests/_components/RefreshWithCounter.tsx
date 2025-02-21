"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react"; // Import Lucide refresh icon
import { cn } from "@/lib/utils"; // Import utility for class merging

const RefreshWithCounter: React.FC = () => {
  const router = useRouter();
  const [timer, setTimer] = useState(30); // Starts at 30 seconds

  useEffect(() => {
    setTimer(30); // Reset timer whenever component mounts (i.e., after reload)
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }

    if (timer === 0) {
      setTimer(30); // Reset timer immediately before reloading
      router.refresh(); // Auto-reload the page
    }
  }, [timer, router]);

  // Handle manual refresh with timer reset
  const handleManualRefresh = () => {
    setTimer(30); // Reset timer
    router.refresh(); // Reload the page
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg min-w-[120px] h-12 border shadow-sm",
        "bg-green-100 border-green-500"
      )}
    >
      <span className="text-sm font-medium text-gray-700">
        Reloading in <span className="font-bold text-red-500">{timer}s</span>
      </span>
      <button
        onClick={handleManualRefresh}
        className="p-1 rounded-md hover:bg-gray-200 transition"
        aria-label="Refresh Now"
      >
        <RefreshCw className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default RefreshWithCounter;
