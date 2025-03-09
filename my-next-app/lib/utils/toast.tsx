// toastUtils.js
import { toast } from "react-hot-toast";
import { AlertTriangle } from "lucide-react"; // Import the warning icon from lucide-react

/**
 * Displays a warning toast notification.
 * @param {string} message - The message to display in the toast.
 */
export const toastWarning = (message: string) => {
  toast.error(message, {
    icon: <AlertTriangle size={20} color="#ffcc00" />, // Use the AlertTriangle icon
    style: {
      background: "#fff3cd", // Light yellow background
      color: "#856404", // Dark yellow text
      border: "1px solid #ffeeba", // Border color
    },
  });
};
