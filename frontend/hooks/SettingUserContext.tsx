'use client';

import { fetchDomainUsers, fetchRoles } from '@/lib/services/setting-user';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of the context
interface UserContextType {
  domainUsers: DomainUser[];
  roles: Role[];
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedUsers, fetchedRoles] = await Promise.all([
          fetchDomainUsers(),
          fetchRoles(),
        ]);
        setDomainUsers(fetchedUsers);
        setRoles(fetchedRoles);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <SettingUserContext.Provider value={{ domainUsers, roles, loading }}>
      {children}
    </SettingUserContext.Provider>
  );
};

// Custom hook to use the context
export const useUserContext = () => {
  const context = useContext(SettingUserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a SettingUserProvider');
  }
  return context;
};
