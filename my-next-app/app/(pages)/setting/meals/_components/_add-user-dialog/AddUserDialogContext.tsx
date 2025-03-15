// AddUserDialogContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchDomainUsers, submitAddUser } from "@/app/actions/setting-user";
import { toastWarning } from "@/lib/utils/toast";
import toast from "react-hot-toast";
import { useSettingUserContext } from "@/hooks/SettingUserContext";

interface AddUserDialogContextProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  setSelectedUser: (user: DomainUser | null) => void;
  selectedRoles: number[];
  setSelectedRoles: React.Dispatch<React.SetStateAction<number[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Context for managing the Add User dialog’s state and logic.
 */
const AddUserDialogContext = createContext<AddUserDialogContextProps | undefined>(
  undefined
);

/**
 * Provider component for the AddUserDialogContext.
 *
 * @param {ReactNode} children - The child components.
 */
export function AddUserDialogProvider({ children }: { children: ReactNode }) {
  const {  setDomainUsers, mutate } = useSettingUserContext();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DomainUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch domain users when the drawer is opened.
  useEffect(() => {
    if (isDrawerOpen) {
      setLoading(true);
      fetchDomainUsers()
        .then((users) => setDomainUsers(users))
        .finally(() => setLoading(false));
    }
  }, [isDrawerOpen, setDomainUsers]);

  /**
   * Resets the form state.
   */
  const resetForm = () => {
    setSelectedUser(null);
    setSelectedRoles([]);
    setIsDrawerOpen(false);
  };

  /**
   * Handles the submission of the Add User form.
   *
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toastWarning("Please select a user.");
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role.");
      return;
    }


    if (!selectedUser) {
      toast.error("Failed to find the selected user.");
      return;
    }

    const response = await submitAddUser(
      selectedUser.username,
      selectedUser.fullname,
      selectedUser.title,
      selectedRoles
    );

    if (response.success) {
      toast.success("User added successfully.");
      await mutate();
      resetForm();
    } else {
      toast.error("Failed to add user.");
    }
  };

  const value = {
    isDrawerOpen,
    setIsDrawerOpen,
    setSelectedUser,
    selectedRoles,
    setSelectedRoles,
    loading,
    setLoading,
    resetForm,
    handleSubmit,
  };

  return (
    <AddUserDialogContext.Provider value={value}>
      {children}
    </AddUserDialogContext.Provider>
  );
}

/**
 * Custom hook to consume the AddUserDialogContext.
 *
 * @returns {AddUserDialogContextProps} The context value.
 */
export function useAddUserDialogContext() {
  const context = useContext(AddUserDialogContext);
  if (!context) {
    throw new Error(
      "useAddUserDialogContext must be used within a AddUserDialogProvider"
    );
  }
  return context;
}
