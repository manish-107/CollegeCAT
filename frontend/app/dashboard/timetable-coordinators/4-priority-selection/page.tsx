'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery } from '@tanstack/react-query';
import { 
  getAllPrioritiesByYearOptions,
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import type { 
  FacultyPriorityWithDetailsResponse, 
  PrioritySubjectResponse 
} from '@/app/client/types.gen';

export default function PrioritySelectionPage() {
  const { selectedYear } = useYearBatch();
  const [selectedLecturer, setSelectedLecturer] = useState<number | null>(null);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch priorities for the selected year
  const { 
    data: prioritiesData, 
    isLoading, 
    error: fetchError 
  } = useQuery({
    ...getAllPrioritiesByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  const priorities = prioritiesData?.priorities || [];

  // Split faculty into submitted and not submitted
  const submitted = priorities.filter((faculty) => faculty.priority_subjects && faculty.priority_subjects.length > 0);
  const notSubmitted = priorities.filter((faculty) => !faculty.priority_subjects || faculty.priority_subjects.length === 0);

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

  const handleLecturerClick = (facultyId: number) => {
    setSelectedLecturer(selectedLecturer === facultyId ? null : facultyId);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-12">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading priorities...</span>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-12">
        <div className="text-center py-8">
          <div className="text-red-700">
            <strong>Error:</strong> Failed to fetch priorities. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Lecturer Priority Selection</h2>
      
      {/* Year Context */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Current Context</h3>
              <div className="text-sm text-blue-700 mt-1">
                <span className="font-medium">Academic Year:</span> {selectedYear || 'Not selected'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">Priorities loaded from API</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submitted Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold mb-2">Preferences Submitted</h3>
        {submitted.length === 0 ? (
          <p className="text-muted-foreground italic">No faculty have submitted their preferences yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {submitted.map((faculty) => (
              <Card
                key={faculty.faculty_id}
                className={`transition-all duration-200 border-2 ${selectedLecturer === faculty.faculty_id ? 'border-primary shadow-lg' : 'border-primary hover:shadow'} cursor-pointer`}
                onClick={() => handleLecturerClick(faculty.faculty_id)}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-lg flex flex-col">
                    <span>{faculty.faculty_name}</span>
                    <span className="text-sm text-muted-foreground">{faculty.faculty_email}</span>
                  </CardTitle>
                  <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                    {selectedLecturer === faculty.faculty_id ? 'Hide Preferences' : 'Show Preferences'}
                  </span>
                </CardHeader>
                {selectedLecturer === faculty.faculty_id && (
                  <>
                    <hr className="my-2 border-muted" />
                    <CardContent>
                      <Label className="mb-3 block text-base font-semibold">Subject Priority List</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {faculty.priority_subjects
                          .sort((a, b) => a.priority - b.priority)
                          .map((subject, idx) => (
                          <div
                            key={subject.id}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 shadow-sm"
                          >
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                              {subject.priority}
                            </span>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.subject_type)}`}>
                                  {getTypeLabel(subject.subject_type)}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200">
                                  {subject.subject_code}
                                </span>
                              </div>
                              <span className="font-semibold text-sm">{subject.subject_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Not Submitted Section */}
      <div className="space-y-2 mt-8">
        <h3 className="text-lg font-semibold mb-2">Preferences Not Submitted</h3>
        {notSubmitted.length === 0 ? (
          <p className="text-muted-foreground italic">All faculty have submitted their preferences.</p>
        ) : (
          <ul className="space-y-2">
            {notSubmitted.map((faculty) => (
              <li key={faculty.faculty_id} className="border rounded p-3 bg-muted/50 flex flex-col">
                <span className="font-semibold">{faculty.faculty_name}</span>
                <span className="text-sm text-muted-foreground">{faculty.faculty_email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
