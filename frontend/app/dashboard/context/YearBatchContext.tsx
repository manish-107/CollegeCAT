'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { BatchResponse } from '@/app/client/types.gen';

interface YearBatchContextType {
  selectedYear: string;
  selectedBatch: BatchResponse | null;
  setSelectedYear: (year: string) => void;
  setSelectedBatch: (batch: BatchResponse | null) => void;
  batches: BatchResponse[];
  setBatches: (batches: BatchResponse[]) => void;
}

const YearBatchContext = createContext<YearBatchContextType | undefined>(undefined);

export const useYearBatch = () => {
  const context = useContext(YearBatchContext);
  if (context === undefined) {
    throw new Error('useYearBatch must be used within a YearBatchProvider');
  }
  return context;
};

interface YearBatchProviderProps {
  children: ReactNode;
}

export const YearBatchProvider: React.FC<YearBatchProviderProps> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<BatchResponse | null>(null);
  const [batches, setBatches] = useState<BatchResponse[]>([]);

  const value = {
    selectedYear,
    selectedBatch,
    setSelectedYear,
    setSelectedBatch,
    batches,
    setBatches,
  };

  return (
    <YearBatchContext.Provider value={value}>
      {children}
    </YearBatchContext.Provider>
  );
}; 