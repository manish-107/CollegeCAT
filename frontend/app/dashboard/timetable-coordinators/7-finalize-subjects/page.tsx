'use client';

import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery } from '@tanstack/react-query';
import { 
  getAllocationsByYearOptions,
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import type { FacultySubjectAllocationResponse } from '@/app/client/types.gen';

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

  const handleDownloadPDF = async () => {
    const input = cardRef.current;
    if (!input) {
      console.error('Card ref not found');
      return;
    }

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ 
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Subject_Allocation_${selectedBatch?.section || 'All'}_${selectedYear || 'Unknown'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-8">
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
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center py-8">
          <div className="text-red-700">
            <strong>Error:</strong> Failed to fetch allocations. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Finalize Subject Allocation</h2>
      
      {/* Year and Batch Context */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Current Context</h3>
              <div className="text-sm text-blue-700 mt-1">
                <span className="font-medium">Academic Year:</span> {selectedYear || 'Not selected'}
              </div>
              {selectedBatch && (
                <div className="text-sm text-blue-700 mt-1">
                  <span className="font-medium">Selected Batch:</span> {selectedBatch.section} ({selectedBatch.noOfStudent} students)
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">Subject allocations from API</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/30 shadow-sm hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedBatch ? `${selectedBatch.section}` : 'All Batches'} <span className="text-muted-foreground font-normal">({selectedYear})</span>
            </CardTitle>
            <Button onClick={handleDownloadPDF} size="sm" disabled={uniqueAllocations.length === 0}>
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent ref={cardRef}>
          {uniqueAllocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedBatch 
                ? `No subjects allocated for batch ${selectedBatch.section} yet.`
                : 'No subjects allocated yet.'
              }
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {uniqueAllocations.map((allocation) => (
                <div
                  key={allocation.allocation_id}
                  className="border rounded-lg p-4 bg-muted/50 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
                      {allocation.subject_code}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(allocation.subject_type)}`}>
                      {getTypeLabel(allocation.subject_type)}
                    </span>
                  </div>
                  <div className="font-semibold text-base">{allocation.subject_name}</div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Lecturer:</span> {allocation.faculty_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Email:</span> {allocation.faculty_email}
                  </div>
                  <div className="text-xs text-muted-foreground">
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
