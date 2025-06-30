"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery } from '@tanstack/react-query';
import { getYearsWithBatchesOptions, getPrioritiesByFacultyAndYearOptions } from '@/app/client/@tanstack/react-query.gen';

const getTypeColor = (type: string): string => {
  switch (type) {
    case "CORE":
      return "bg-blue-100 text-blue-800";
    case "ELECTIVE":
      return "bg-green-100 text-green-800";
    case "LAB":
      return "bg-purple-100 text-purple-800";
    case "PROJECT":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case "CORE":
      return "Core";
    case "ELECTIVE":
      return "Elective";
    case "LAB":
      return "Lab";
    case "PROJECT":
      return "Project";
    default:
      return "Unknown";
  }
};

export default function FacultyViewSubjectsPage() {
  const { selectedYear } = useYearBatch();
  // Get year_id from context
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch priorities for faculty_id 1 and this year
  const { data, isLoading, error } = useQuery({
    ...getPrioritiesByFacultyAndYearOptions({ path: { faculty_id: 1, year_id: yearId! } }),
    enabled: !!yearId
  });

  // Flatten all batches' subjects into a single array
  const priorities = data?.batches?.flatMap(batch => batch.subjects) || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLoading ? "Loading..." : priorities.length > 0 ? "Assigned Subjects" : "No Subjects Assigned"}
      </h2>
      {error && <div className="text-center text-red-500">Failed to load subjects.</div>}
      <div className="grid grid-cols-2 gap-4">
        {priorities.map((subject) => (
          <div key={subject.subject_id}>
            <span className="inline-block mb-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Assigned</span>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-lg flex flex-col">
                  <span>{subject.subject_name}</span>
                </CardTitle>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeColor(subject.subject_type)}`}>
                  {getTypeLabel(subject.subject_type)}
                </span>
              </CardHeader>
              <CardContent>
                <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200">
                  {subject.subject_code}
                </span>
                <span className="ml-4 text-xs text-muted-foreground">Priority: {subject.priority}</span>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
