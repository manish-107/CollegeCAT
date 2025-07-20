"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getYearsWithBatchesOptions,
  getSubjectsByYearOptions,
  submitFacultyPrioritiesMutation,
  getPrioritiesByFacultyAndYearOptions
} from '@/app/client/@tanstack/react-query.gen';
import type { SubjectResponse } from '@/app/client/types.gen';
import { toast } from 'sonner';
import { Eye, Edit, Clock, CheckCircle, AlertCircle, Users, Plus, RotateCcw } from 'lucide-react';
import { useUser } from "../../context/UserContext";

const getTypeColor = (type: string): string => {
  switch (type) {
    case "CORE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ELECTIVE":
      return "bg-green-100 text-green-800 border-green-200";
    case "LAB":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "PROJECT":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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

export default function FacultyPriorityManagementPage() {
  const { selectedYear, selectedBatch } = useYearBatch();
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectResponse[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  const queryClient = useQueryClient();

  // TODO: Replace with actual faculty_id from auth/context
  const { user_id } = useUser()

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch subjects for the selected year
  const { data: subjectsData, isLoading: isSubjectsLoading, error: subjectsError } = useQuery({
    ...getSubjectsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });
  const subjects: SubjectResponse[] = subjectsData?.subjects || [];

  // Fetch faculty priorities
  const {
    data: facultyPriorityData,
    isLoading: isPrioritiesLoading,
    error: prioritiesError,
    refetch: refetchPriorities
  } = useQuery({
    ...getPrioritiesByFacultyAndYearOptions({
      path: {
        faculty_id: user_id,
        year_id: yearId!
      }
    }),
    enabled: !!yearId
  });

  // Submit mutation
  const submitMutation = useMutation({
    ...submitFacultyPrioritiesMutation(),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Preferences submitted successfully!');
      // Refetch priorities to update the view tab
      refetchPriorities();
      // Switch to view tab after successful submission
      setActiveTab("view");
    },
    onError: (err: any) => {
      toast.error('Failed to submit preferences');
    }
  });

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
          faculty_id: user_id,
          year_id: yearId,
          priorities: selectedSubjects.map((subject, idx) => ({
            subject_id: subject.subject_id,
            batch_id: selectedBatch.batch_id,
            priority: idx + 1
          }))
        }
      });
    } catch (err: any) {
      console.error('Submit error:', err);
    }
  };

  const handleCreateNew = () => {
    setSelectedSubjects([]);
    setSubmitted(false);
    setActiveTab("create");
  };

  const hasExistingPriorities = facultyPriorityData?.batches && facultyPriorityData.batches.length > 0;

  if (!yearId) {
    return (
      <div className="space-y-8 mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 bg-amber-50 p-4 border border-amber-200 rounded-lg text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span>Please select an academic year to manage your priorities.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto p-6 max-w-6xl">
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-2xl">Subject Priority Management</h2>
        <p className="text-muted-foreground">
          Manage your subject preferences for {selectedYear}
          {selectedBatch && ` - ${selectedBatch.section}`}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View Priorities
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create/Edit Priorities
          </TabsTrigger>
        </TabsList>

        {/* View Tab */}
        <TabsContent value="view" className="space-y-6">
          {isPrioritiesLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex justify-center items-center gap-2">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Loading your priorities...</span>
                </div>
              </CardContent>
            </Card>
          ) : prioritiesError || !hasExistingPriorities ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center gap-2 text-blue-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">No Priorities Found</span>
                  </div>
                  <p className="text-muted-foreground">
                    You haven't submitted any subject priorities for {selectedYear} yet.
                  </p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 w-4 h-4" />
                    Create Priorities
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Priorities Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        You have submitted priorities for {facultyPriorityData.batches.length} batch(es) in {selectedYear}.
                      </p>
                      <p className="mt-1 text-muted-foreground text-sm">
                        Total subjects: {facultyPriorityData.batches.reduce((total, batch) => total + batch.subjects.length, 0)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchPriorities()}
                      >
                        <RotateCcw className="mr-2 w-4 h-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priorities by Batch */}
              <div className="space-y-6">
                {facultyPriorityData.batches.map((batch) => (
                  <Card key={batch.batch_id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5 text-blue-500" />
                        Batch {batch.section}
                        <span className="font-normal text-muted-foreground text-sm">
                          ({batch.noOfStudent} students)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {batch.subjects
                          .sort((a, b) => a.priority - b.priority)
                          .map((subject) => (
                            <div
                              key={subject.subject_id}
                              className="flex items-center gap-4 bg-muted/30 hover:bg-muted/50 p-4 border rounded-lg transition-colors"
                            >
                              <div className="flex justify-center items-center bg-primary rounded-full w-10 h-10 font-bold text-primary-foreground text-lg">
                                {subject.priority}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(subject.subject_type)}`}>
                                {getTypeLabel(subject.subject_type)}
                              </span>
                              <span className="bg-gray-100 px-3 py-1 border border-gray-200 rounded-full font-mono text-gray-700 text-xs">
                                {subject.subject_code}
                              </span>
                              <div className="flex-1">
                                <h3 className="font-semibold text-base">{subject.subject_name}</h3>
                                <p className="text-muted-foreground text-sm">
                                  {subject.abbreviation}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-primary text-2xl">
                      {facultyPriorityData.batches.reduce((total, batch) => total + batch.subjects.length, 0)}
                    </div>
                    <div className="text-muted-foreground text-sm">Total Subjects</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-blue-600 text-2xl">
                      {facultyPriorityData.batches.reduce((total, batch) =>
                        total + batch.subjects.filter(s => s.subject_type === 'CORE').length, 0
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">Core Subjects</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-green-600 text-2xl">
                      {facultyPriorityData.batches.reduce((total, batch) =>
                        total + batch.subjects.filter(s => s.subject_type === 'ELECTIVE').length, 0
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">Elective Subjects</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-purple-600 text-2xl">
                      {facultyPriorityData.batches.reduce((total, batch) =>
                        total + batch.subjects.filter(s => s.subject_type === 'LAB').length, 0
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">Lab Subjects</div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Create/Edit Tab */}
        <TabsContent value="create" className="space-y-6">
          {hasExistingPriorities && (
            <Card className="bg-gray-100 dark:bg-gray-900 dark:border-orange-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-black dark:text-orange-300">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Note:</span>
                  <span className="text-sm">
                    Submitting new priorities will replace your existing preferences.
                  </span>
                </div>
              </CardContent>
            </Card>


          )}

          <Card>
            <CardHeader>
              <CardTitle>Select Your Subject Preferences</CardTitle>
              <p className="text-muted-foreground text-sm">
                Choose up to 5 subjects in order of preference. Click to select/deselect.
              </p>
            </CardHeader>
            <CardContent>
              {!selectedBatch?.batch_id ? (
                <div className="py-8 font-semibold text-yellow-600 text-center">
                  Please select a batch to submit your preferences.
                </div>
              ) : isSubjectsLoading ? (
                <div className="py-8 text-center">Loading subjects...</div>
              ) : subjectsError ? (
                <div className="py-8 text-red-500 text-center">Failed to load subjects.</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="gap-4 grid grid-cols-2">
                    {subjects.map((subject) => {
                      const selectedIdx = selectedSubjects.findIndex((s) => s.subject_id === subject.subject_id);
                      return (
                        <Card
                          key={subject.subject_id}
                          className={`transition-all duration-200 border-2 cursor-pointer ${selectedIdx !== -1 ? "border-primary shadow-lg bg-primary/10" : "border-muted hover:shadow"
                            }`}
                          onClick={() => handleSelect(subject)}
                        >
                          <CardHeader className="flex flex-row justify-between items-center gap-2">
                            <CardTitle className="flex flex-col text-lg">
                              <span>{subject.subject_name}</span>
                            </CardTitle>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${getTypeColor(subject.subject_type)}`}>
                              {getTypeLabel(subject.subject_type)}
                            </span>
                          </CardHeader>
                          <CardContent>
                            <span className="bg-gray-100 px-2 py-1 border border-gray-200 rounded-full font-mono text-gray-700 text-xs">
                              {subject.subject_code}
                            </span>
                            {selectedIdx !== -1 && (
                              <span className="ml-4 font-semibold text-primary">Selected as #{selectedIdx + 1}</span>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={selectedSubjects.length === 0 || submitted || submitMutation.isPending || !selectedBatch?.batch_id}
                      size="lg"
                    >
                      {submitMutation.isPending ? "Submitting..." : hasExistingPriorities ? "Update Preferences" : "Submit Preferences"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {selectedSubjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Priority List</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {selectedSubjects.map((subject, idx) => (
                    <li key={subject.subject_id} className="flex items-center gap-4 bg-muted/50 shadow-sm p-4 border rounded-lg">
                      <span className="flex justify-center items-center bg-primary mr-2 rounded-full w-7 h-7 font-bold text-primary-foreground">
                        {idx + 1}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(subject.subject_type)}`}>
                        {getTypeLabel(subject.subject_type)}
                      </span>
                      <span className="bg-gray-100 ml-2 px-2 py-1 border border-gray-200 rounded-full font-mono text-gray-700 text-xs">
                        {subject.subject_code}
                      </span>
                      <span className="ml-2 font-semibold">{subject.subject_name}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
