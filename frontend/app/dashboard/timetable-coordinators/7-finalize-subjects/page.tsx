'use client';

import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery } from '@tanstack/react-query';
import {
  getAllocationsByYearOptions,
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import type { FacultySubjectAllocationResponse } from '@/app/client/types.gen';
import { toast } from 'sonner';
const getTypeColor = (type: string) => {
  switch (type) {
    case 'CORE': return 'bg-blue-100 text-blue-800';
    case 'ELECTIVE': return 'bg-green-100 text-green-800';
    case 'LAB': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'CORE': return 'Core';
    case 'ELECTIVE': return 'Elective';
    case 'LAB': return 'Lab';
    default: return 'Unknown';
  }
};

export default function FinalizeSubjectsPage() {
  const { selectedYear, selectedBatch } = useYearBatch();
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch allocations for the selected year
  const {
    data: allocationsData,
    isLoading,
    error: fetchError
  } = useQuery({
    ...getAllocationsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  const allocations = allocationsData?.allocations || [];

  // Filter allocations by selected batch
  const filteredAllocations = selectedBatch
    ? allocations.filter(allocation => allocation.batch_section === selectedBatch.section)
    : allocations;

  // Remove duplicates based on subject_id and batch_id combination
  const uniqueAllocations = filteredAllocations.filter((allocation, index, self) =>
    index === self.findIndex(a =>
      a.subject_id === allocation.subject_id && a.batch_id === allocation.batch_id
    )
  );

  const handleDownloadPDF = () => {
    console.log("handleDownloadPDF")
    toast.success("Download pdf")
  };


  if (isLoading) {
    return (
      <div className="space-y-8 mx-auto p-6 max-w-5xl">
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading allocations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="space-y-8 mx-auto p-6 max-w-5xl">
        <div className="py-8 text-center">
          <div className="text-red-700">
            <strong>Error:</strong> Failed to fetch allocations. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto p-6 max-w-5xl">
      <h2 className="mb-6 font-bold text-2xl text-center">Finalize Subject Allocation</h2>



      <Card className="shadow-sm hover:shadow-lg border-2 border-primary/30 transition-all">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {selectedBatch ? `${selectedBatch.section}` : 'All Batches'} <span className="font-normal text-muted-foreground">({selectedYear})</span>
            </CardTitle>
            <Button onClick={handleDownloadPDF} size="sm" disabled={uniqueAllocations.length === 0}>
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent ref={cardRef}>
          {uniqueAllocations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {selectedBatch
                ? `No subjects allocated for batch ${selectedBatch.section} yet.`
                : 'No subjects allocated yet.'
              }
            </p>
          ) : (
            <div className="gap-2 grid grid-cols-2">
              {uniqueAllocations.map((allocation) => (
                <div
                  key={allocation.allocation_id}
                  className="flex flex-col gap-2 bg-muted/50 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-100 px-2 py-1 border border-gray-200 rounded-full font-mono text-gray-700 text-xs">
                      {allocation.subject_code}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(allocation.subject_type)}`}>
                      {getTypeLabel(allocation.subject_type)}
                    </span>
                  </div>
                  <div className="font-semibold text-base">{allocation.subject_name}</div>
                  <div className="text-muted-foreground text-sm">
                    <span className="font-medium">Lecturer:</span> {allocation.faculty_name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    <span className="font-medium">Email:</span> {allocation.faculty_email}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    <span className="font-medium">Priority:</span> {allocation.allocated_priority}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
