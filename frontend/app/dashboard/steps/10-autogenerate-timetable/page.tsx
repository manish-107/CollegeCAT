'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type TimetableSlot = {
  type: 'class' | 'lab' | 'break';
  subject?: string;
};

type Timetable = {
  [day: string]: TimetableSlot[];
};

const timeSlots = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
];

const generateDummyTimetable = (): Timetable => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const subjects = ['Math', 'AI', 'DSA', 'Cloud', 'ML', 'Networks', 'Elective'];
  const labSubjects = ['OS Lab', 'AI Lab', 'DB Lab', 'Network Lab'];
  const timetable: Timetable = {};

  let labCount = 0;

  for (const day of days) {
    const slots: TimetableSlot[] = Array(8).fill(null).map(() => ({
      type: 'class',
      subject: subjects[Math.floor(Math.random() * subjects.length)],
    }));

    // Apply lab only if under max weekly limit and not yet applied today
    if (labCount < 3) {
      const possibleStartIndexes = [0, 1, 2, 3, 4]; // ensures room for 3 periods
      const startIdx = possibleStartIndexes[Math.floor(Math.random() * possibleStartIndexes.length)];

      // Check if slots are free for lab placement
      const canPlaceLab = slots.slice(startIdx, startIdx + 3).every((s) => s.type === 'class');
      if (canPlaceLab) {
        const labSubject = labSubjects[labCount % labSubjects.length];
        for (let i = 0; i < 3; i++) {
          slots[startIdx + i] = {
            type: 'lab',
            subject: labSubject,
          };
        }
        labCount++;
      }
    }

    timetable[day] = slots;
  }

  return timetable;
};


export default function AutoGenerateTimetablePage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [timetable, setTimetable] = useState<Timetable | null>(null);

  const isSelectionValid = selectedBatch && selectedYear;

  const handleAutoGenerate = () => {
    const generated = generateDummyTimetable();
    setTimetable(generated);
  };

  const sendToHOD = () => {
    console.log('Sending to HOD:', {
      batch: selectedBatch,
      year: selectedYear,
      timetable,
    });
    alert('Timetable sent to HOD for approval.');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Auto Generate Timetable</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Select Batch</Label>
            <Select
              value={selectedBatch}
              onValueChange={setSelectedBatch}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCA-A">MCA-A</SelectItem>
                <SelectItem value="MCA-B">MCA-B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Select Academic Year</Label>
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isSelectionValid && !timetable && (
        <Button onClick={handleAutoGenerate}>Auto Generate Timetable</Button>
      )}

      {timetable && (
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Generated Timetable: {selectedBatch} - {selectedYear}
            </CardTitle>
            <Button onClick={sendToHOD}>Send to HOD</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2 text-xs font-semibold border-b pb-2 text-center">
              {timeSlots.map((slot, idx) => (
                <div key={idx}>{slot}</div>
              ))}
            </div>

            {Object.entries(timetable).map(([day, slots]) => (
              <div key={day}>
                <h3 className="mt-6 mb-2 font-medium text-sm">{day}</h3>
                <div className="grid grid-cols-8 gap-2">
                  {slots.map((slot, idx) => {
                    // Skip if part of a lab that already started earlier
                    if (
                      idx > 0 &&
                      slot.type === 'lab' &&
                      slots[idx - 0]?.type === 'lab' &&
                      slots[idx - 1]?.type === 'lab'
                    ) {
                      return null;
                    }

                    // Handle lab block (3-hour)
                    if (
                      slot.type === 'lab' &&
                      idx <= 5 &&
                      slots[idx + 1]?.type === 'lab' &&
                      slots[idx + 2]?.type === 'lab'
                    ) {
                      return (
                        <div
                          key={idx}
                          className="col-span-3 border-input dark:bg-input/30 dark:hover:bg-input/50 text-center gap-2 rounded-md border bg-transparent px-2 py-2"
                        >
                          <p className="text-xs italic text-yellow-300">LAB</p>
                          {slot.subject && (
                            <p className="text-sm">{slot.subject}</p>
                          )}
                        </div>
                      );
                    }

                    // Handle normal class slot
                    const textColor =
                      slot.type === 'lab'
                        ? 'text-yellow-300'
                        : slot.type === 'class'
                          ? 'text-green-300'
                          : 'text-gray-600';

                    return (
                      <div
                        key={idx}
                        className="border-input dark:bg-input/30 dark:hover:bg-input/50 text-center gap-2 rounded-md border bg-transparent px-2 py-2"
                      >
                        <p className={`text-xs italic ${textColor}`}>
                          {slot.type.toUpperCase()}
                        </p>
                        {slot.subject && (
                          <p className="text-sm">{slot.subject}</p>
                        )}
                      </div>
                    );
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
