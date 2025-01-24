"use client";

import { useEffect, useState } from "react";

interface AlertProps {
    id: string;
    message: string;
    type: "success" | "warning" | "error";
    onRemove: (id: string) => void;
    duration?: number;
}

export default function Alert({ id, message, type, onRemove, duration = 3000 }: AlertProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration - 500);

        return () => clearTimeout(timer);
    }, [duration]);

    useEffect(() => {
        if (!isVisible) {
            const timer = setTimeout(() => {
                onRemove(id);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onRemove, id]);

    const alertStyles = {
        success: "bg-green-500",
        warning: "bg-yellow-500",
        error: "bg-red-500",
    };

    return (
        <div
            className={`p-4 rounded-lg shadow-lg text-white transition-all duration-500 ease-in-out transform ${isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
                } ${alertStyles[type]}`}
        >
            {message}
        </div>
    );
}
