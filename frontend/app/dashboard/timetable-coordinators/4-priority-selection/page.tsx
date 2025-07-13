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

  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  const {
    data: prioritiesData,
    isLoading,
    error: fetchError
  } = useQuery({
    ...getAllPrioritiesByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  const priorities = prioritiesData?.priorities || [];
  const submitted = priorities.filter((faculty) => faculty.priority_subjects && faculty.priority_subjects.length > 0);
  const notSubmitted = priorities.filter((faculty) => !faculty.priority_subjects || faculty.priority_subjects.length === 0);

const getTypeColor = (type: string) => {
  switch (type) {
    case 'CORE':
      return 'bg-sky-50 text-sky-800 border border-sky-200';
    case 'ELECTIVE':
      return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    case 'LAB':
      return 'bg-amber-50 text-amber-800 border border-amber-200';
    default:
      return 'bg-gray-50 text-gray-800 border border-gray-200';
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
      <div className="space-y-12 mx-auto p-6 max-w-2xl">
        <div className="flex justify-center items-center py-8">
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
      <div className="space-y-12 mx-auto p-6 max-w-2xl">
        <div className="py-8 text-center">
          <div className="text-red-700">
            <strong>Error:</strong> Failed to fetch priorities. Please try again.
          </div>
        </div>
      </div>
    );
  }

  const groupedByBatch = submitted.reduce((acc, faculty) => {
    faculty.priority_subjects?.forEach((subject) => {
      const batch = subject.batch_section ?? 'Unknown';
      if (!acc[batch]) acc[batch] = {};
      if (!acc[batch][faculty.faculty_id]) {
        acc[batch][faculty.faculty_id] = {
          faculty_id: faculty.faculty_id,
          faculty_name: faculty.faculty_name,
          faculty_email: faculty.faculty_email,
          subjects: []
        };
      }
      acc[batch][faculty.faculty_id].subjects.push(subject);
    });
    return acc;
  }, {} as Record<string, Record<number, { faculty_id: number, faculty_name: string, faculty_email: string, subjects: PrioritySubjectResponse[] }>>);

  return (
    <div className="space-y-12 mx-auto p-6 max-w-5xl">
      <h2 className="mb-6 font-bold text-2xl text-center">Lecturer Priority Selection</h2>

      {/* Submitted Section */}
      <div className="space-y-8">
        {Object.entries(groupedByBatch).map(([batch, facultyMap]) => (
          <div key={batch} className="space-y-4">
            <h3 className="pb-1 font-semibold text-black dark:text-white text-xl">Batch: {batch}</h3>

            {Object.values(facultyMap).map((faculty) => (
              <Card
                key={`${batch}-${faculty.faculty_id}`}
                className={`transition-all duration-200 border-2 ${
                  selectedLecturer === faculty.faculty_id ? 'border-gray-700 shadow-lg' : 'border-muted hover:shadow'
                } cursor-pointer`}
                onClick={() => handleLecturerClick(faculty.faculty_id)}
              >
                <CardHeader className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <CardTitle className="font-semibold text-lg">{faculty.faculty_name}</CardTitle>
                    <span className="text-muted-foreground text-sm">{faculty.faculty_email}</span>
                  </div>
                  <span className="font-medium text-primary text-sm">
                    {selectedLecturer === faculty.faculty_id ? 'Hide' : 'Show'} Preferences
                  </span>
                </CardHeader>

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    selectedLecturer === faculty.faculty_id ? 'max-h-[1000px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
                  }`}
                >
                  <hr className="my-1 border-muted" />
                  <CardContent>
                    <Label className="block mb-3 font-semibold text-base">Subject Priorities</Label>
                    <div className="flex flex-wrap gap-3">
                      {faculty.subjects.sort((a, b) => a.priority - b.priority).map((subject) => (
                        <div
                          key={subject.id}
                          className="flex items-center gap-2 bg-muted shadow-sm px-3 py-2 border border-border rounded-lg"
                        >
                          <span className="flex justify-center items-center bg-primary rounded-full w-5 h-5 font-bold text-white dark:text-black text-xs">
                            {subject.priority}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{subject.subject_name}</span>
                            <div className="flex gap-2 mt-1 text-muted-foreground text-xs">
                              <span className={`${getTypeColor(subject.subject_type)} px-2 py-0.5 rounded-full text-xs font-medium`}>
                                {getTypeLabel(subject.subject_type)}
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 border rounded font-mono text-gray-700">
                                {subject.subject_code}
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 border rounded font-mono text-gray-700">
                                {subject.batch_section}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {/* Not Submitted Section */}
      <div className="space-y-2 mt-8">
        <h3 className="mb-2 font-semibold text-lg">Preferences Not Submitted</h3>
        {notSubmitted.length === 0 ? (
          <p className="text-muted-foreground italic">All faculty have submitted their preferences.</p>
        ) : (
          <ul className="space-y-2">
            {notSubmitted.map((faculty) => (
              <li key={faculty.faculty_id} className="flex flex-col bg-muted/50 p-3 border rounded">
                <span className="font-semibold">{faculty.faculty_name}</span>
                <span className="text-muted-foreground text-sm">{faculty.faculty_email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
