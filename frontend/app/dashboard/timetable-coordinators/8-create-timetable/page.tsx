'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTimetableFormatMutation,
  getYearsWithBatchesOptions, getAllTimetableFormatsQueryKey
} from '@/app/client/@tanstack/react-query.gen';
import { toast } from 'sonner';
import Link from 'next/link';

type PeriodType = 'empty' | 'class' | 'lab' | 'break';

interface Period {
  type: PeriodType;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

interface TimetableDay {
  day: string;
  periods: Period[];
}

const TimetableFormatPage = () => {
  const { selectedYear, selectedBatch } = useYearBatch();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Create mutation for saving timetable format
  const createTimetableMutation = useMutation({
    ...createTimetableFormatMutation(),
    onSuccess: () => {
      toast.success('Timetable format saved successfully!');
      setIsSaving(false);
    },
    onError: (error) => {
      console.error('Error saving timetable:', error);
      toast.error('Failed to save timetable format. Please try again.');
      setIsSaving(false);
    }
  });

  // Initialize timetable with 9 periods and proper breaks
  const initializeTimetable = (): TimetableDay[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return days.map(day => ({
      day,
      periods: [
        { type: 'empty', startTime: '9:00 AM', endTime: '9:55 AM', isBreak: false },
        { type: 'empty', startTime: '9:55 AM', endTime: '10:50 AM', isBreak: false },
        { type: 'break', startTime: '10:50 AM', endTime: '11:05 AM', isBreak: true }, // Morning break
        { type: 'empty', startTime: '11:05 AM', endTime: '12:00 PM', isBreak: false },
        { type: 'empty', startTime: '12:00 PM', endTime: '12:55 PM', isBreak: false },
        { type: 'break', startTime: '12:55 PM', endTime: '2:00 PM', isBreak: true }, // Lunch break
        { type: 'empty', startTime: '2:00 PM', endTime: '2:55 PM', isBreak: false },
        { type: 'empty', startTime: '2:55 PM', endTime: '3:50 PM', isBreak: false },
        { type: 'empty', startTime: '3:50 PM', endTime: '4:45 PM', isBreak: false },
      ]
    }));
  };

  const [timetable, setTimetable] = useState<TimetableDay[]>(initializeTimetable());

  const convertToApiFormat = () => {
    const compressPeriods = (periods: Period[]): number[] => {
      const result: number[] = [];
      let i = 0;

      while (i < periods.length) {
        const period = periods[i];

        if (period.isBreak || period.type === 'empty') {
          i++;
          continue;
        }

        if (period.type === 'lab') {
          result.push(3);

          // Skip the next 2 non-break lab periods
          let labSkipped = 1; // already counted this lab
          i++;

          while (i < periods.length && labSkipped < 3) {
            if (!periods[i].isBreak && periods[i].type === 'lab') {
              labSkipped++;
            }
            i++;
          }

          continue; // go to next outer loop iteration
        }

        if (period.type === 'class') {
          result.push(1);
          i++;
        } else {
          i++;
        }
      }

      return result;
    };


const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

const apiData = {
  year_id: yearId!,
  batch_id: selectedBatch?.batch_id!,
  format_name: `Timetable Format - ${selectedYear} - ${selectedBatch?.section} - ${randomSuffix}`,
  format_data: {
    monday: compressPeriods(timetable[0].periods),
    tuesday: compressPeriods(timetable[1].periods),
    wednesday: compressPeriods(timetable[2].periods),
    thursday: compressPeriods(timetable[3].periods),
    friday: compressPeriods(timetable[4].periods),
    saturday: compressPeriods(timetable[5].periods),
  }
};

    console.log("Compressed Format:", apiData);
    return apiData;
  };


  const handlePeriodChange = (dayIndex: number, periodIndex: number) => {
    const updatedTimetable = [...timetable];
    const day = updatedTimetable[dayIndex];
    const period = day.periods[periodIndex];

    // Don't allow changes to break periods
    if (period.isBreak) return;

    // Cycle through: empty → class → lab → empty
    let newType: PeriodType = 'empty';

    if (period.type === 'empty') {
      newType = 'class';
    } else if (period.type === 'class') {
      // Check if there's already a lab on this day
      const hasExistingLab = day.periods.some(p => p.type === 'lab');
      if (hasExistingLab) {
        // If lab already exists, just cycle to empty
        newType = 'empty';
      } else {
        // Check if we can create a lab block (3 consecutive periods, excluding breaks)
        const canCreateLab = checkLabCreation(day.periods, periodIndex);
        if (canCreateLab) {
          newType = 'lab';
          // Set the next two non-break periods to lab as well
          let labCount = 1;
          for (let i = periodIndex + 1; i < day.periods.length && labCount < 3; i++) {
            if (!day.periods[i].isBreak) {
              day.periods[i].type = 'lab';
              labCount++;
            }
          }
        } else {
          newType = 'empty';
        }
      }
    } else if (period.type === 'lab') {
      // Find the start of the lab block and clear all 3 lab periods (excluding breaks)
      clearLabBlock(day.periods, periodIndex);
      setTimetable(updatedTimetable);
      return;
    }

    period.type = newType;
    setTimetable(updatedTimetable);
  };

  const checkLabCreation = (periods: Period[], startIndex: number): boolean => {
    let labCount = 1; // Start with the current period
    let checkedCount = 0;

    // Check next periods for lab creation (excluding breaks)
    for (let i = startIndex + 1; i < periods.length && labCount < 3; i++) {
      if (!periods[i].isBreak) {
        labCount++;
      }
      checkedCount++;
    }

    return labCount >= 3;
  };

  const clearLabBlock = (periods: Period[], periodIndex: number) => {
    // Find the start of the lab block
    let start = periodIndex;

    // Look backwards to find the start
    for (let i = periodIndex - 1; i >= 0; i--) {
      if (periods[i].type === 'lab' && !periods[i].isBreak) {
        start = i;
      } else {
        break;
      }
    }

    // Clear all 3 lab periods (excluding breaks)
    let clearedCount = 0;
    for (let i = start; i < periods.length && clearedCount < 3; i++) {
      if (periods[i].type === 'lab' && !periods[i].isBreak) {
        periods[i].type = 'empty';
        clearedCount++;
      }
    }
  };

  const getPeriodStyle = (period: Period) => {
    const baseClasses = "border rounded-md text-xs cursor-pointer transition-all font-medium";

    if (period.isBreak) {
      return `${baseClasses} text-yellow-500  text-xs border-yellow-500 bg-input/30 hover:bg-input/50 cursor-not-allowed`;
    }

    switch (period.type) {
      case 'class':
        return `${baseClasses}  text-blue-600 border-blue-600 bg-input/30 hover:bg-input/50`;
      case 'lab':
        return `${baseClasses} text-green-600 border-green-600 bg-input/30 hover:bg-input/50`;
      case 'empty':
      default:
        return `${baseClasses}  bg-input/30 hover:bg-input/50 text-gray-200 border-gray-200`;
    }
  };

  const getPeriodText = (period: Period) => {
    if (period.isBreak) {
      return period.startTime === '10:50 AM' ? 'Morning Break' : 'Lunch Break';
    }

    switch (period.type) {
      case 'class':
        return 'Class';
      case 'lab':
        return 'Lab';
      case 'empty':
      default:
        return 'Empty';
    }
  };


  const saveTimetable = async () => {
    if (!yearId || !selectedBatch?.batch_id) {
      toast.error('Please select a year and batch first.');
      return;
    }

    setIsSaving(true);
    const apiData = convertToApiFormat();

    try {
      await createTimetableMutation.mutateAsync({
        body: apiData
      });
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const resetTimetable = () => {
    setTimetable(initializeTimetable());
    toast.success('Timetable reset to default format');
  };

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span>Create Timetable Format</span>
            {selectedYear && selectedBatch && (
              <span className="font-normal text-muted-foreground text-sm">
                ({selectedYear} - {selectedBatch.section})
              </span>
            )}
          </CardTitle>
          <div className="ml-auto">
            <Link href="/dashboard/timetable-coordinators/8-create-timetable/viewformats">
              <Button variant="outline" size="sm">View Saved Formats</Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {!selectedYear || !selectedBatch ? (
            <div className="flex items-center gap-2 bg-amber-50 p-4 border border-amber-200 rounded-lg text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span>Please select an academic year and batch to create timetable format.</span>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Schedule Structure</h3>
                    <div className="space-y-1 text-muted-foreground text-sm">
                      <div>• 9 periods per day (55 minutes each)</div>
                      <div>• Morning break: 10:50 AM - 11:05 AM (15 minutes)</div>
                      <div>• Lunch break: 12:55 PM - 2:00 PM (65 minutes)</div>
                      <div>• Extended day: 9:00 AM - 4:45 PM</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={resetTimetable}
                      size="sm"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={saveTimetable}
                      disabled={isSaving}
                      size="sm"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 w-4 h-4" />
                          Save Format
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500 border rounded w-4 h-4"></div>
                    <span>Class Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-500 border rounded w-4 h-4"></div>
                    <span>Lab Period (3 consecutive)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-100 border border-yellow-300 rounded w-4 h-4"></div>
                    <span>Break Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-50 border border-gray-200 rounded w-4 h-4"></div>
                    <span>Empty Period</span>
                  </div>
                </div>
              </div>

              {/* Timetable Grid */}
              <div className="space-y-6">
                {timetable.map((day, dayIndex) => (
                  <div key={day.day} className="space-y-3">
                    <h3 className="pb-2 border-b font-bold text-lg">
                      {day.day}
                    </h3>
                    <div className="gap-1 grid grid-cols-25">
                      {day.periods.map((period, periodIndex) => (
                        <div
                          key={periodIndex}
                          className={`${period.isBreak ? 'col-span-2' : 'col-span-3'
                            } ${getPeriodStyle(period)}`}
                          onClick={() => handlePeriodChange(dayIndex, periodIndex)}
                        >
                          <div className="py-2 text-center">
                            <div className="font-semibold text-xs">{getPeriodText(period)}</div>
                            <div className="opacity-75 mt-1 text-xs">
                              {period.startTime} - {period.endTime}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 border border-blue-200 rounded-lg">
                <h4 className="mb-2 font-semibold">Instructions:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Click on empty periods to cycle: Empty → Class → Lab → Empty</li>
                  <li>• Lab periods automatically create 3 consecutive periods</li>
                  <li>• Only one lab slot (3 periods) can be selected per day</li>
                  <li>• Break periods cannot be modified</li>
                  <li>• Click on any lab period to clear the entire 3-period block</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableFormatPage;
