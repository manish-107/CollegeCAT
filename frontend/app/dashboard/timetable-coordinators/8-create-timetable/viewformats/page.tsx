'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTimetableFormatsOptions,
  getAllTimetableFormatsQueryKey,
} from '@/app/client/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const deleteTimetableFormat = async (format_id: number) => {
  const res = await fetch(`/api/timetable-formats/${format_id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Delete failed');
};

const breakPeriods = [2, 5]; // fixed break indices for morning & lunch

const getPeriodText = (type: string, start: string) => {
  if (type === 'break') {
    return start === '10:50 AM' ? 'Morning Break' : 'Lunch Break';
  }
  return type === 'class' ? 'Class' : type === 'lab' ? 'Lab' : 'Empty';
};

const getPeriodStyle = (type: string, isBreak: boolean) => {
  const base = 'border rounded-md text-xs font-medium text-center p-2';
  if (isBreak) return `${base} text-yellow-500 border-yellow-500 bg-input/30`;
  if (type === 'class') return `${base} text-blue-600 border-blue-600 bg-input/30`;
  if (type === 'lab') return `${base} text-green-600 border-green-600 bg-input/30`;
  return `${base} text-gray-400 border-gray-300 bg-input/30`;
};

const defaultTimings = [
  ['9:00 AM', '9:55 AM'],
  ['9:55 AM', '10:50 AM'],
  ['10:50 AM', '11:05 AM'], // break
  ['11:05 AM', '12:00 PM'],
  ['12:00 PM', '12:55 PM'],
  ['12:55 PM', '2:00 PM'], // lunch
  ['2:00 PM', '2:55 PM'],
  ['2:55 PM', '3:50 PM'],
  ['3:50 PM', '4:45 PM'],
];

const decompressPeriods = (compressed: number[]) => {
  const periods: string[] = Array(9).fill('empty');
  let index = 0;

  for (let i = 0; i < compressed.length && index < periods.length;) {
    if (breakPeriods.includes(index)) {
      periods[index] = 'break';
      index++;
      continue;
    }

    const value = compressed[i];
    if (value === 3) {
      let labFilled = 0;
      while (labFilled < 3 && index < periods.length) {
        if (!breakPeriods.includes(index)) {
          periods[index] = 'lab';
          labFilled++;
        }
        index++;
      }
    } else if (value === 1) {
      while (index < periods.length && breakPeriods.includes(index)) index++;
      if (index < periods.length) periods[index++] = 'class';
    }
    i++;
  }

  // Ensure breaks
  breakPeriods.forEach(i => periods[i] = 'break');
  return periods;
};

export default function ViewFormatsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: formatsData, isLoading, isError } = useQuery(getAllTimetableFormatsOptions());
  const formats = formatsData ?? [];

  const selectedFormat = formats.find(f => f.format_id.toString() === selectedId);

  const mutation = useMutation({
    mutationFn: (id: number) => deleteTimetableFormat(id),
    onSuccess: () => {
      toast.success('Format deleted');
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: getAllTimetableFormatsQueryKey() });
    },
    onError: () => toast.error('Failed to delete format'),
  });

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">View Timetable Formats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p>Loading formats...</p>
          ) : isError ? (
            <p className="text-red-500">Failed to load formats.</p>
          ) : formats.length === 0 ? (
            <p className="text-muted-foreground">No timetable formats available.</p>
          ) : (
            <>
              <Select onValueChange={setSelectedId} value={selectedId ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem
                      key={format.format_id}
                      value={format.format_id.toString()}
                    >
                      {format.format_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedFormat ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{selectedFormat.format_name}</p>
                      <p className="text-muted-foreground text-sm">
                        {selectedFormat.year_details.academic_year} - {selectedFormat.batch_details.section}
                      </p>
                    </div>
                    {/* Uncomment if delete is needed */}
                    {/* <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => mutation.mutate(selectedFormat.format_id)}
                      disabled={mutation.isLoading}
                    >
                      <Trash2 className="mr-1 w-4 h-4" />
                      {mutation.isLoading ? 'Deleting...' : 'Delete'}
                    </Button> */}
                  </div>

                  {/* Grid Display */}
                  <div className="space-y-6">
                    {Object.entries(selectedFormat.format_data).map(([day, compressed]) => {
                      const periods = decompressPeriods(compressed as number[]);
                      return (
                        <div key={day}>
                          <h3 className="pb-2 border-b font-bold text-lg capitalize">{day}</h3>
                          <div className="gap-1 grid grid-cols-25">
                            {periods.map((type, i) => (
                              <div
                                key={i}
                                className={`${type === 'break' ? 'col-span-2' : 'col-span-3'} ${getPeriodStyle(type, type === 'break')}`}
                              >
                                <div>
                                  <div className="font-semibold text-xs">{getPeriodText(type, defaultTimings[i][0])}</div>
                                  <div className="opacity-75 mt-1 text-xs">
                                    {defaultTimings[i][0]} - {defaultTimings[i][1]}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Select a format to view its details</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
