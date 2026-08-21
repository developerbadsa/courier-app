'use client';

import React from 'react';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { MaintenancePage } from './MaintenancePage';

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isUnderMaintenance, isLoading } = useMaintenance();

  if (isUnderMaintenance) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};
