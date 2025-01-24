'use client';

import { fetchRoles, fetchUsers } from '@/lib/services/setting-user';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of the context
interface UserContextType {
  domainUsers: DomainUser[];
  setDomainUsers: React.Dispatch<React.SetStateAction<DomainUser[]>>;
  roles: Role[];
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
        const [fetchedRoles, fetchedUsers] = await Promise.all([
          fetchRoles(),
          fetchUsers(),
        ]);
        setRoles(fetchedRoles);
        setUsers(fetchedUsers);
        setDomainUsers(fetchedUsers); // Ensure domainUsers is set initially
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Mutate function to refresh users
  const mutate = async () => {
    try {
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      setDomainUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating users:', error);
    }
  };

  return (
    <SettingUserContext.Provider
      value={{
        domainUsers,
        setDomainUsers,
        roles,
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
