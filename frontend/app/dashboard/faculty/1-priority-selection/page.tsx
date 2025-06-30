"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getYearsWithBatchesOptions, getSubjectsByYearOptions, submitFacultyPrioritiesMutation } from '@/app/client/@tanstack/react-query.gen';
import type { SubjectResponse } from '@/app/client/types.gen';
import { toast } from 'sonner';

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

export default function FacultyPrioritySelectionPage() {
  const { selectedYear, selectedBatch } = useYearBatch();
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectResponse[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch subjects for the selected year
  const { data: subjectsData, isLoading, error } = useQuery({
    ...getSubjectsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });
  const subjects: SubjectResponse[] = subjectsData?.subjects || [];

  // Submit mutation
  const submitMutation = useMutation(submitFacultyPrioritiesMutation());

  const handleSelect = (subject: SubjectResponse) => {
    if (selectedSubjects.find((s) => s.subject_id === subject.subject_id)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s.subject_id !== subject.subject_id));
    } else if (selectedSubjects.length < 5) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!yearId || !selectedBatch?.batch_id) return;
    try {
      await submitMutation.mutateAsync({
        body: {
          faculty_id: 1, // TODO: Replace with real faculty_id from auth
          year_id: yearId,
          priorities: selectedSubjects.map((subject, idx) => ({
            subject_id: subject.subject_id,
            batch_id: selectedBatch.batch_id,
            priority: idx + 1
          }))
        }
      });
      setSubmitted(true);
      toast.success('Preferences submitted successfully!');
    } catch (err: any) {
      toast.error('Failed to submit preferences');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Subject Priority Selection</h2>
      <p className="mb-4 text-center text-muted-foreground">
        Choose up to 5 subjects in order of preference. Click to select/deselect. Drag to reorder (optional).
      </p>
      {(!selectedBatch?.batch_id) && (
        <div className="text-center py-8 text-yellow-600 font-semibold">Please select a batch to submit your preferences.</div>
      )}
      {isLoading ? (
        <div className="text-center py-8">Loading subjects...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Failed to load subjects.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {subjects.map((subject) => {
              const selectedIdx = selectedSubjects.findIndex((s) => s.subject_id === subject.subject_id);
              return (
                <Card
                  key={subject.subject_id}
                  className={`transition-all duration-200 border-2 cursor-pointer ${
                    selectedIdx !== -1 ? "border-primary shadow-lg bg-primary/10" : "border-muted hover:shadow"
                  }`}
                  onClick={() => handleSelect(subject)}
                >
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
                    {selectedIdx !== -1 && (
                      <span className="ml-4 text-primary font-semibold">Selected as #{selectedIdx + 1}</span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex justify-center">
            <Button type="submit" disabled={selectedSubjects.length === 0 || submitted || submitMutation.isPending || !selectedBatch?.batch_id}>
              {submitMutation.isPending ? "Submitting..." : submitted ? "Submitted" : "Submit Preferences"}
            </Button>
          </div>
        </form>
      )}
      {submitted && (
        <div className="mt-6 text-center text-green-600 font-semibold">Preferences submitted successfully!</div>
      )}
      {selectedSubjects.length > 0 && (
        <div className="mt-8">
          <Label className="mb-3 block text-base font-semibold">Your Priority List</Label>
          <ol className="space-y-2">
            {selectedSubjects.map((subject, idx) => (
              <li key={subject.subject_id} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50 shadow-sm">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-2">
                  {idx + 1}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.subject_type)}`}>{getTypeLabel(subject.subject_type)}</span>
                <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200 ml-2">
                  {subject.subject_code}
                </span>
                <span className="font-semibold ml-2">{subject.subject_name}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
} 