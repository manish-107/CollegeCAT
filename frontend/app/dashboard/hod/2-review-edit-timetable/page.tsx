'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Loader2, Save, Send, Edit, AlertCircle, Plus } from 'lucide-react';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getYearsWithBatchesOptions,
  getSubjectsByYearOptions,
  getAllocationsByYearOptions,
  updateTimetableModuleMutation,
  getTimetableByYearAndBatchOptions,
} from '@/app/client/@tanstack/react-query.gen';
import { toast } from 'sonner';
import Link from 'next/link';

type PeriodType = 'empty' | 'class' | 'lab' | 'break';

interface Period {
  type: PeriodType;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  selectedSubject?: string;
  selectedLecturer?: string;
}

interface TimetableDay {
  day: string;
  periods: Period[];
}

export default function EditTimetablePage() {
  const { selectedYear, selectedBatch } = useYearBatch();
  const [timetable, setTimetable] = useState<TimetableDay[] | null>(null);
  const [existingTimetableId, setExistingTimetableId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch existing timetable
  const { 
    data: existingTimetableData, 
    isLoading: timetableLoading, 
    error: timetableError 
  } = useQuery({
    ...getTimetableByYearAndBatchOptions({
      path: { year_id: yearId!, batch_id: selectedBatch?.batch_id! },
    }),
    enabled: !!yearId && !!selectedBatch?.batch_id,
  });

  // Fetch subjects for the selected year
  const { data: subjectsData } = useQuery({
    ...getSubjectsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  // Fetch allocations for the selected year
  const { data: allocationsData } = useQuery({
    ...getAllocationsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  // Update timetable module mutation
  const updateTimetableMutation = useMutation({
    ...updateTimetableModuleMutation(),
    onSuccess: () => {
      toast.success('Timetable updated successfully!');
      // Refresh the timetable data
      queryClient.invalidateQueries({
        queryKey: getTimetableByYearAndBatchOptions({
          path: { year_id: yearId!, batch_id: selectedBatch?.batch_id! },
        }).queryKey,
      });
    },
    onError: (error) => {
      console.error('Error updating timetable:', error);
      toast.error('Failed to update timetable. Please try again.');
    }
  });

  // Memoize subjects and allocations to prevent infinite re-renders
  const subjects = useMemo(() => subjectsData?.subjects || [], [subjectsData?.subjects]);
  const allocations = useMemo(() => allocationsData?.allocations || [], [allocationsData?.allocations]);

  // Memoize batch allocations
  const batchAllocations = useMemo(() => {
    return selectedBatch
      ? allocations.filter(allocation => allocation.batch_section === selectedBatch.section)
      : [];
  }, [allocations, selectedBatch]);

  // Helper function to check if a subject is a lab subject
  const isLabSubject = useCallback((subject: any) => {
    return subject.subject_type === 'LAB' ||
      subject.subject_type === 'Lab' ||
      subject.subject_type === 'lab' ||
      subject.subject_name.toLowerCase().includes('lab') ||
      subject.subject_code.toLowerCase().includes('lab');
  }, []);

  // Helper function to extract error message
  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error?.response?.status === 404) {
      return `Timetable not found for year ID: ${yearId} and batch ID: ${selectedBatch?.batch_id}`;
    }
    return "Failed to load timetable. Please try again.";
  };

  // Initialize timetable from existing data
  const initializeTimetableFromExisting = useCallback((existingData: any, formatData: any) => {
    if (!existingData || !formatData) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const filteredTimeSlots = [
      '9:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '12:00 PM - 1:00 PM',
      '1:00 PM - 2:00 PM',
      '2:00 PM - 3:00 PM',
      '3:00 PM - 4:00 PM',
      '4:00 PM - 5:00 PM',
    ];

    return dayNames.map((dayName, dayIndex) => {
      const dayKey = days[dayIndex];
      const periodsData = formatData[dayKey] || [];
      const existingDayData = existingData[dayKey] || [];

      return {
        day: dayName,
        periods: periodsData.map((periodType: number, periodIndex: number) => {
          let periodTypeEnum: PeriodType = 'empty';
          if (periodType === 1) {
            periodTypeEnum = 'class';
          } else if (periodType === 3) {
            periodTypeEnum = 'lab';
          } else if (periodType === 0) {
            periodTypeEnum = 'empty';
          }

          // Get existing subject for this period
          const existingSubject = existingDayData[periodIndex];
          let selectedSubjectId: string | undefined;
          let selectedLecturer: string | undefined;

          if (existingSubject && existingSubject !== '' && existingSubject !== 'FREE') {
            // Find subject by abbreviation
            const subject = subjects.find(s => s.abbreviation === existingSubject);
            if (subject) {
              selectedSubjectId = subject.subject_id.toString();
              
              // Find lecturer for this subject
              const lecturerAllocation = batchAllocations.find(
                a => a.subject_name === subject.subject_name
              );
              selectedLecturer = lecturerAllocation?.faculty_name || 'Not Assigned';
            }
          }

          return {
            type: periodTypeEnum,
            startTime: filteredTimeSlots[periodIndex]?.split(' - ')[0] || '',
            endTime: filteredTimeSlots[periodIndex]?.split(' - ')[1] || '',
            isBreak: false,
            selectedSubject: selectedSubjectId,
            selectedLecturer: selectedLecturer,
          };
        })
      };
    });
  }, [subjects, batchAllocations]);

  // Load existing timetable data
  useEffect(() => {
    if (existingTimetableData?.timetable_data && existingTimetableData?.format_details) {
      setExistingTimetableId(existingTimetableData.timetable_id || null);
      
      const initializedTimetable = initializeTimetableFromExisting(
        existingTimetableData.timetable_data,
        existingTimetableData.format_details.format_data
      );
      
      if (initializedTimetable) {
        setTimetable(initializedTimetable);
      }
    }
  }, [existingTimetableData, initializeTimetableFromExisting]);

  const handleSubjectChange = (dayIndex: number, periodIndex: number, subjectId: string) => {
    if (!timetable) return;

    const updatedTimetable = [...timetable];
    const day = updatedTimetable[dayIndex];
    const period = day.periods[periodIndex];

    // Find the selected subject
    const selectedSubject = subjects.find(s => s.subject_id.toString() === subjectId);

    if (selectedSubject) {
      // For lab periods, apply to all consecutive lab periods
      if (period.type === 'lab') {
        // Find the start of the lab block
        let start = periodIndex;
        for (let i = periodIndex - 1; i >= 0; i--) {
          if (day.periods[i]?.type === 'lab') {
            start = i;
          } else {
            break;
          }
        }

        // Count consecutive lab periods
        let labCount = 0;
        for (let i = start; i < day.periods.length && day.periods[i]?.type === 'lab'; i++) {
          labCount++;
        }

        // Apply the selection to all lab periods in the block
        for (let i = 0; i < Math.min(3, labCount) && start + i < day.periods.length; i++) {
          if (day.periods[start + i]?.type === 'lab') {
            day.periods[start + i].selectedSubject = selectedSubject.subject_id.toString();

            const lecturerAllocation = batchAllocations.find(
              a => a.subject_name === selectedSubject.subject_name
            );
            day.periods[start + i].selectedLecturer = lecturerAllocation?.faculty_name || 'Not Assigned';
          }
        }
      } else {
        // For regular class periods
        period.selectedSubject = selectedSubject.subject_id.toString();

        const lecturerAllocation = batchAllocations.find(
          a => a.subject_name === selectedSubject.subject_name
        );
        period.selectedLecturer = lecturerAllocation?.faculty_name || 'Not Assigned';
      }
    }

    setTimetable(updatedTimetable);
  };

  const updateTimetable = async () => {
    if (!timetable || !existingTimetableId) {
      toast.error('No timetable to update.');
      return;
    }

    setIsLoading(true);

    // Convert timetable to the format expected by the API
    const timetableData: { [key: string]: string[] } = {};

    timetable.forEach(day => {
      const dayKey = day.day.toLowerCase();
      timetableData[dayKey] = day.periods.map(period => {
        if (period.selectedSubject) {
          const subject = subjects.find(s => s.subject_id.toString() === period.selectedSubject);
          return subject?.abbreviation || 'FREE';
        }
        return 'FREE';
      });
    });

    try {
      await updateTimetableMutation.mutateAsync({
        path: { timetable_id: existingTimetableId },
        body: { timetable_data: timetableData }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (timetableLoading) {
    return (
      <div className="space-y-6 mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading timetable...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No year/batch selected
  if (!yearId || !selectedBatch?.batch_id) {
    return (
      <div className="space-y-6 mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 bg-amber-50 p-4 border border-amber-200 rounded-lg text-amber-600">
              <span>Please select an academic year and batch to edit timetable.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (including 404)
  if (timetableError) {
    return (
      <div className="space-y-6 mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Timetable Not Found</span>
              </div>
              <div className="bg-red-50 p-4 border border-red-200 rounded-lg max-w-md">
                <p className="text-red-700 text-sm">
                  {getErrorMessage(timetableError)}
                </p>
              </div>
              {selectedYear && selectedBatch && (
                <div className="text-muted-foreground text-sm">
                  <p>Selected: {selectedYear} - {selectedBatch.section}</p>
                  <p className="mt-1">Please create a timetable first or verify your selection.</p>
                </div>
              )}
              
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No existing timetable data (shouldn't happen if we reach here, but keeping for safety)
  if (!existingTimetableData?.timetable_data) {
    return (
      <div className="space-y-6 mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2 bg-blue-50 p-4 border border-blue-200 rounded-lg text-blue-600">
                <span>No existing timetable found for {selectedYear} - {selectedBatch.section}. Please create a timetable first.</span>
              </div>
              
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Edit className="w-5 h-5" />
            <span>Edit Timetable</span>
            {selectedYear && selectedBatch && (
              <span className="font-normal text-muted-foreground text-sm">
                ({selectedYear} - {selectedBatch.section})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Update Existing Timetable</h3>
                <div className="space-y-1 text-muted-foreground text-sm">
                  <div>• Modify existing timetable assignments</div>
                  <div>• Select subjects and lecturers for each period</div>
                  <div>• Respects lab periods (3 consecutive periods)</div>
                  <div>• Changes are saved when you click update</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={updateTimetable}
                  disabled={isLoading || updateTimetableMutation.isPending || !timetable}
                  size="sm"
                >
                  {(isLoading || updateTimetableMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 w-4 h-4" />
                      Update Timetable
                    </>
                  )}
                </Button>
              </div>
            </div>

           

            {/* Subject Selection Info */}
            <div className="p-4 border rounded-lg">
              <h4 className="mb-2 font-semibold">Available Subjects & Lecturers:</h4>
              <div className="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-sm">
                {batchAllocations.map((allocation) => (
                  <div key={allocation.allocation_id} className="text-muted-foreground">
                    <span className="font-medium">{allocation.abbreviation}</span>
                    <span className="text-muted-foreground"> - {allocation.faculty_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {timetable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Timetable: {selectedBatch?.section} - {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timetable.map((day, dayIndex) => (
              <div key={day.day} className="space-y-3">
                <h3 className="mt-6 pb-2 border-b font-bold text-lg">
                  {day.day}
                </h3>
                <div className="gap-1 grid grid-cols-28">
                  {day.periods.map((period, periodIndex) => {
                    // Skip rendering lab periods that are not the start of a block
                    if (period.type === 'lab') {
                      if (periodIndex > 0 && day.periods[periodIndex - 1].type === 'lab') {
                        return null;
                      }

                      // Count consecutive lab periods
                      let labCount = 1;
                      for (let i = periodIndex + 1; i < day.periods.length; i++) {
                        if (day.periods[i].type === 'lab') labCount++;
                        else break;
                      }

                      return (
                        <div
                          key={periodIndex}
                          className={`col-span-${labCount * 4} bg-transparent px-2 py-2 border border-green-300 rounded-md text-green-300 text-center`}
                        >
                          <div className="py-2 text-center">
                            <p className="text-green-300 text-xs italic">LAB</p>

                            {/* Subject Display */}
                            {period.selectedSubject && (
                              <div className="mt-1">
                                {(() => {
                                  const subject = subjects.find(s => s.subject_id.toString() === period.selectedSubject);
                                  return (
                                    <p className="font-medium text-green-300 text-sm">
                                      {subject?.abbreviation || period.selectedSubject}
                                    </p>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Lecturer */}
                            {period.selectedLecturer && (
                              <p className="opacity-75 mt-1 text-green-300 text-xs">{period.selectedLecturer}</p>
                            )}

                            {/* Dropdown */}
                            <div className="mt-2">
                              <Select 
                                value={period.selectedSubject || ''}
                                onValueChange={(value) => handleSubjectChange(dayIndex, periodIndex, value)}
                              >
                                <SelectTrigger className="bg-transparent border-green-300 h-8 text-green-300 text-xs">
                                  <span className="text-green-300">Choose Lab</span>
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects
                                    .filter(s => isLabSubject(s))
                                    .map((subject) => (
                                      <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
                                        {subject.abbreviation}
                                      </SelectItem>
                                    ))}
                                  {subjects.filter(s => isLabSubject(s)).length === 0 && (
                                    <SelectItem value="" disabled>No lab subjects</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Handle normal class/empty slot
                      return (
                        <div
                          key={periodIndex}
                          className={`col-span-4 border rounded-md bg-transparent px-2 py-2 text-center ${
                            period.type === 'empty'
                              ? 'border-gray-300 text-gray-600'
                              : 'border-yellow-300 text-yellow-300'
                          }`}
                        >
                          <div className="py-2 text-center">
                            <div className={`font-semibold text-xs italic ${
                              period.type === 'empty' ? 'text-gray-600' : 'text-yellow-300'
                            }`}>
                              {period.type === 'empty' ? 'FREE' : 'CLASS'}
                            </div>
                            
                            {/* Professor Display */}
                            {period.selectedLecturer && (
                              <div className={`text-xs opacity-75 mt-1 ${
                                period.type === 'empty' ? 'text-gray-600' : 'text-yellow-300'
                              }`}>
                                {period.selectedLecturer}
                              </div>
                            )}
                            
                            {/* Subject Display */}
                            {period.selectedSubject && period.type === 'class' && (
                              <div className="mt-1">
                                {(() => {
                                  const subject = subjects.find(s => s.subject_id.toString() === period.selectedSubject);
                                  return (
                                    <p className="font-medium text-yellow-300 text-sm">
                                      {subject?.abbreviation || period.selectedSubject}
                                    </p>
                                  );
                                })()}
                              </div>
                            )}
                            
                            {period.type === 'class' ? (
                              <div className="mt-2">
                                <Select
                                  value={period.selectedSubject || ''}
                                  onValueChange={(value) => handleSubjectChange(dayIndex, periodIndex, value)}
                                >
                                  <SelectTrigger className="bg-transparent border-yellow-300 h-8 text-yellow-300 text-xs">
                                    <span className="text-yellow-300">Choose Sub</span>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {subjects
                                      .filter(s => !isLabSubject(s))
                                      .map((subject) => (
                                        <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
                                          {subject.abbreviation}
                                        </SelectItem>
                                      ))}
                                    {subjects.filter(s => !isLabSubject(s)).length === 0 && (
                                      <SelectItem value="" disabled>
                                        No subjects available
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <div className="mt-1 font-medium text-gray-600 text-sm">Free</div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
