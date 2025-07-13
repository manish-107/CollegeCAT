'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Save, Send } from 'lucide-react';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getYearsWithBatchesOptions,
  getTimetableFormatsByYearAndBatchOptions,
  getSubjectsByYearOptions,
  getAllocationsByYearOptions,
  createTimetableModuleMutation,
  getAllTimetableFormatsOptions
} from '@/app/client/@tanstack/react-query.gen';
import { toast } from 'sonner';

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


export default function CreateTimetablePage() {
  const { selectedYear, selectedBatch } = useYearBatch();
  const [timetable, setTimetable] = useState<TimetableDay[] | null>(null);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch timetable formats for the selected year and batch
  const { data: formatsData } = useQuery(getAllTimetableFormatsOptions());
  const [selectedFormat, setSelectedFormat] = useState<any | null>(null);
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

  // Create timetable module mutation
  const createTimetableMutation = useMutation({
    ...createTimetableModuleMutation(),
    onSuccess: () => {
      toast.success('Timetable saved successfully!');
    },
    onError: (error) => {
      console.error('Error saving timetable:', error);
      toast.error('Failed to save timetable. Please try again.');
    }
  });

  // Helper function to check if a subject is a lab subject
  const isLabSubject = (subject: any) => {
    return subject.subject_type === 'LAB' ||
      subject.subject_type === 'Lab' ||
      subject.subject_type === 'lab' ||
      subject.subject_name.toLowerCase().includes('lab') ||
      subject.subject_code.toLowerCase().includes('lab');
  };

  const subjects = subjectsData?.subjects || [];
  const allocations = allocationsData?.allocations || [];

  // Filter allocations for the selected batch
  const batchAllocations = selectedBatch
    ? allocations.filter(allocation => allocation.batch_section === selectedBatch.section)
    : [];

  // Initialize timetable from format
  const initializeTimetableFromFormat = (formatData: any) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Create filtered time slots (removing breaks)
    const filteredTimeSlots = [
      '9:00 AM - 10:00 AM',    // 0
      '10:00 AM - 11:00 AM',   // 1
      '11:00 AM - 12:00 PM',   // 2 (was 3)
      '12:00 PM - 1:00 PM',    // 3 (was 4)
      '1:00 PM - 2:00 PM',     // 4 (was 6)
      '2:00 PM - 3:00 PM',     // 5 (was 7)
      '3:00 PM - 4:00 PM',     // 6 (was 8)
      '4:00 PM - 5:00 PM',     // 7 (was 9)
    ];

    return dayNames.map((dayName, dayIndex) => {
      const dayKey = days[dayIndex];
      const periodsData = formatData[dayKey] || [];

      console.log(`${dayName} periods:`, periodsData);

     const filteredPeriods = periodsData;

      return {
        day: dayName,
        periods: filteredPeriods.map((periodType: number, periodIndex: number) => {
          let periodTypeEnum: PeriodType = 'empty';
          if (periodType === 1) {
            periodTypeEnum = 'class';
          } else if (periodType === 3) {
            periodTypeEnum = 'lab';
          } else if (periodType === 0) {
            periodTypeEnum = 'empty';
          }

          if (periodTypeEnum === 'lab') {
            console.log(`${dayName} period ${periodIndex}: LAB`);
          }

          return {
            type: periodTypeEnum,
            startTime: filteredTimeSlots[periodIndex].split(' - ')[0],
            endTime: filteredTimeSlots[periodIndex].split(' - ')[1],
            isBreak: false, // No breaks in the timetable
            selectedSubject: undefined,
            selectedLecturer: undefined,
          };
        })
      };
    });
  };

  // Load timetable format when available
  useEffect(() => {
    if (selectedFormat) {
      const initializedTimetable = initializeTimetableFromFormat(selectedFormat.format_data);
      setTimetable(initializedTimetable);
    }
  }, [selectedFormat]);

  const handleSubjectChange = (dayIndex: number, periodIndex: number, subjectId: string) => {
    if (!timetable) return;

    const updatedTimetable = [...timetable];
    const day = updatedTimetable[dayIndex];
    const period = day.periods[periodIndex];

    // Find the selected subject
    const selectedSubject = subjects.find(s => s.subject_id.toString() === subjectId);

    if (selectedSubject) {
      // For lab periods, apply to all 3 consecutive lab periods
      if (period.type === 'lab') {
        console.log(`Lab selection: ${selectedSubject.abbreviation} at period ${periodIndex}`);
        console.log('All periods in this day:', day.periods.map((p, i) => `${i}: ${p.type}`));

        // Find the start of the lab block
        let start = periodIndex;
        for (let i = periodIndex - 1; i >= 0; i--) {
          if (day.periods[i]?.type === 'lab') {
            start = i;
          } else {
            break;
          }
        }

        console.log(`Lab block starts at period ${start}`);

        // Count how many consecutive lab periods we have
        let labCount = 0;
        for (let i = start; i < day.periods.length && day.periods[i]?.type === 'lab'; i++) {
          labCount++;
        }
        console.log(`Found ${labCount} consecutive lab periods starting from ${start}`);

        // Apply the selection to all 3 lab periods (or however many we have)
        for (let i = 0; i < Math.min(3, labCount) && start + i < day.periods.length; i++) {
          if (day.periods[start + i]?.type === 'lab') {
            console.log(`Applying to period ${start + i}`);
            day.periods[start + i].selectedSubject = selectedSubject.subject_id.toString();

            // Find lecturer for this subject and batch
            const lecturerAllocation = batchAllocations.find(
              a => a.subject_name === selectedSubject.subject_name
            );

            day.periods[start + i].selectedLecturer = lecturerAllocation?.faculty_name || 'Not Assigned';
          }
        }
      } else {
        // For regular class periods
        period.selectedSubject = selectedSubject.subject_id.toString();

        // Find lecturer for this subject and batch
        const lecturerAllocation = batchAllocations.find(
          a => a.subject_name === selectedSubject.subject_name
        );

        period.selectedLecturer = lecturerAllocation?.faculty_name || 'Not Assigned';
      }
    }

    setTimetable(updatedTimetable);
  };

  const getPeriodStyle = (period: Period) => {
    const baseClasses = "border-input dark:bg-input/30 dark:hover:bg-input/50 text-center gap-2 rounded-md border bg-transparent px-2 py-2";

    if (period.isBreak) {
      return `${baseClasses} cursor-not-allowed`;
    }

    return baseClasses;
  };

  const getPeriodTextColor = (period: Period) => {
    if (period.isBreak) {
      return 'text-gray-600';
    }

    if (period.selectedSubject) {
      return 'text-green-300';
    }

    switch (period.type) {
      case 'class':
        return 'text-green-300';
      case 'lab':
        return 'text-yellow-300';
      case 'empty':
      default:
        return 'text-gray-600';
    }
  };

  const getPeriodText = (period: Period) => {
    if (period.isBreak) {
      return period.startTime === '10:50 AM' ? 'Morning Break' : 'Lunch Break';
    }

    if (period.selectedSubject) {
      return period.selectedSubject;
    }

    switch (period.type) {
      case 'class':
        return 'Select Sub';
      case 'lab':
        return 'Select Lab';
      case 'empty':
      default:
        return 'Free';
    }
  };

  const saveTimetable = async () => {
    if (!timetable) {
      toast.error('No timetable to save.');
      return;
    }

    if (!yearId || !selectedBatch?.batch_id || !formatsData || formatsData.length === 0) {
      toast.error('Missing required data. Please ensure year, batch, and format are selected.');
      return;
    }

    // Convert timetable to the format expected by the API
    const timetableData: { [key: string]: string[] } = {};

    timetable.forEach(day => {
      const dayKey = day.day.toLowerCase();
      timetableData[dayKey] = day.periods.map(period => {
        if (period.selectedSubject) {
          // Convert subject ID back to abbreviation
          const subject = subjects.find(s => s.subject_id.toString() === period.selectedSubject);
          return subject?.abbreviation || 'FREE';
        }
        return 'FREE';
      });
    });

    const format = formatsData[0]; // Use the first format

    createTimetableMutation.mutate({
      body: {
        format_id: format.format_id,
        year_id: yearId,
        batch_id: selectedBatch.batch_id,
        timetable_data: timetableData
      }
    });
  };

  const sendToHOD = () => {
    if (!timetable) {
      toast.error('No timetable to send.');
      return;
    }

    console.log('Sending to HOD:', {
      batch: selectedBatch,
      year: selectedYear,
      yearId,
      timetable,
    });

    toast.success('Timetable sent to HOD for approval.');
  };

  if (!yearId || !selectedBatch?.batch_id) {
    return (
      <div className="space-y-6 mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 bg-amber-50 p-4 border border-amber-200 rounded-lg text-amber-600">
              <span>Please select an academic year and batch to create timetable.</span>
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
            <span>Create Timetable</span>
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
                <h3 className="font-semibold text-lg">Manual Timetable Creation</h3>
                <div className="space-y-1 text-muted-foreground text-sm">
                  <div>• Uses the timetable format created in previous step</div>
                  <div>• Select subjects and lecturers for each period</div>
                  <div>• Respects lab periods (3 consecutive periods)</div>
                  <div>• Maintains break periods as defined in format</div>
                </div>
              </div>
              <div className="w-full max-w-sm">
                <label className="block mb-2 font-medium text-gray-700 text-sm">Select Timetable Format</label>
                <Select onValueChange={(formatId) => {
                  const format = formatsData?.find(f => f.format_id.toString() === formatId);
                  if (format) setSelectedFormat(format);
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatsData?.map(format => (
                      <SelectItem key={format.format_id} value={format.format_id.toString()}>
                        {format.format_name} ({format.year_details.academic_year} - {format.batch_details.section})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveTimetable}
                  disabled={createTimetableMutation.isPending || !timetable}
                  size="sm"
                >
                  {createTimetableMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 w-4 h-4" />
                      Save Timetable
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
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Timetable: {selectedBatch?.section} - {selectedYear}
            </CardTitle>
            <Button onClick={sendToHOD} size="sm">
              <Send className="mr-2 w-4 h-4" />
              Send to HOD
            </Button>
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
                      // Check if it's part of a previous lab block
                      if (periodIndex > 0 && day.periods[periodIndex - 1].type === 'lab') {
                        return null; // skip rendering this part of the lab block
                      }

                      // Count how many consecutive lab periods from current index
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
                              <Select onValueChange={(value) => handleSubjectChange(dayIndex, periodIndex, value)}>
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
                      // Handle normal class slot
                      return (
                        <div
                          key={periodIndex}
                          className={`col-span-4 border rounded-md bg-transparent px-2 py-2 text-center ${period.type === 'empty'
                            ? 'border-gray-300 text-gray-600'
                            : 'border-yellow-300 text-yellow-300'
                            }`}
                        >
                          <div className="py-2 text-center">
                            <div className={`font-semibold text-xs italic ${period.type === 'empty' ? 'text-gray-600' : 'text-yellow-300'
                              }`}>
                              {period.type === 'empty' ? 'FREE' : 'CLASS'}
                            </div>
                            {/* Professor Display */}
                            {period.selectedLecturer && (
                              <div className={`text-xs opacity-75 mt-1 ${period.type === 'empty' ? 'text-gray-600' : 'text-yellow-300'
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
