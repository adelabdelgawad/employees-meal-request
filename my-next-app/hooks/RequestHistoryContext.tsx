'use client';

import clientAxiosInstance from '@/lib/clientAxiosInstance';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';


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
const RequestHistoryContext = createContext<UserContextType | null>(null);

// Create a provider component
export const RequestHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [domainUsers, setDomainUsers] = useState<DomainUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await clientAxiosInstance.get(`/setting/users`);
        const data = await response.data;
        setRoles(data.roles);
        setUsers(data.users);
        setDomainUsers(data.domain_users);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to get the Users.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const mutate = async () => {
    try {
      const response = await clientAxiosInstance.get(`/setting/users`);
      const data = await response.data;
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
