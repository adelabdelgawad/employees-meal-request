'use client';

import clientAxiosInstance from '@/lib/clientAxiosInstance';
import { fetchUsers } from '@/app/actions/setting-user';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Define the shape of the context
interface UserContextType {
  domainUsers: DomainUser[];
  setDomainUsers: React.Dispatch<React.SetStateAction<DomainUser[]>>;
  roles: Role[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  users: User[];
  loading: boolean;
  mutate: () => Promise<void>;
}

// Create the context
const SettingUserContext = createContext<UserContextType | undefined>(
  undefined,
);

// Create a provider component
export const SettingUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [domainUsers, setDomainUsers] = useState<DomainUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
        try {
          const response = await clientAxiosInstance.get(`/setting/users`);
            const data =  await response.data;
            setRoles(data.roles);
            setUsers(data.users);
            setDomainUsers(data.domain_users);
          } catch (error) {
          console.error("Error fetching roles:", error);
          toast.error("Failed to get the Users.");
        }
    };

    loadData();
    setLoading(false)
  }, []);

  // Mutate function to refresh users
  const mutate = async () => {
    try {
      const response = await clientAxiosInstance.get(`/setting/users`);
        const data =  await response.data;
        setRoles(data.roles);
        setUsers(data.users);
        setDomainUsers(data.domain_users);
      } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to get the Users.");
    }
  };

  return (
    <SettingUserContext.Provider
      value={{
        domainUsers,
        setDomainUsers,
        roles,
        setUsers,
        users,
        loading,
        mutate,
      }}
    >
      {children}
    </SettingUserContext.Provider>
  );
};

// Custom hook to use the context
export const useSettingUserContext = () => {
  const context = useContext(SettingUserContext);
  if (!context) {
    throw new Error(
      'useSettingUserContext must be used within a SettingUserProvider',
    );
  }
  return context;
};
