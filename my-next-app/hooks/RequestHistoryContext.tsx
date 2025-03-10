'use client';

import clientAxiosInstance from '@/lib/clientAxiosInstance';
import { fetchUsers } from '@/lib/services/setting-user';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Define the shape of the context
interface UserContextType {
  
  mutate: () => Promise<void>;
}

// Create the context
const RequestHistoryContext = createContext<UserContextType | undefined>(
  undefined,
);

// Create a provider component
export const RequestHistoryProvider: React.FC<{ children: React.ReactNode }> = ({
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
    <RequestHistoryContext.Provider
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
    </RequestHistoryContext.Provider>
  );
};

// Custom hook to use the context
export const useRequestHistoryContext = () => {
  const context = useContext(RequestHistoryContext);
  if (!context) {
    throw new Error(
      'useRequestHistoryContext must be used within a RequestHistoryProvider',
    );
  }
  return context;
};
