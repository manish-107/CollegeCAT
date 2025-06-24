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
  type?: 'class' | 'lab' | 'break';
  unavailableLecturer?: string;
};

type ReviewTimetable = {
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

const lecturers = [
  'Dr. A',
  'Dr. B',
  'Prof. C',
  'Prof. D',
 
];

const initialFormat: ReviewTimetable = {
  Monday: Array(8).fill({ type: 'class' }),
  Tuesday: Array(8).fill({ type: 'class' }),
  Wednesday: Array(8).fill({ type: 'lab' }),
  Thursday: Array(8).fill({ type: 'class' }),
  Friday: Array(8).fill({ type: 'break' }),
};

export default function FormatReviewPage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const isSelectionValid = selectedBatch && selectedYear;

  const [reviewTimetable, setReviewTimetable] = useState<ReviewTimetable>(
    initialFormat
  );

  const updateSlotUnavailableLecturer = (
    day: string,
    index: number,
    lecturer: string
  ) => {
    const updated = { ...reviewTimetable };
    updated[day][index] = {
      ...updated[day][index],
      unavailableLecturer: lecturer,
    };
    setReviewTimetable(updated);
  };

  const saveReviewTimetable = () => {
    console.log('Reviewed Timetable Format:', {
      year: selectedYear,
      batch: selectedBatch,
      data: reviewTimetable,
    });
    alert('Timetable review saved successfully!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Batch & Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Review Timetable Format</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Select Batch</Label>
            <Select
              value={selectedBatch}
              onValueChange={(value) => setSelectedBatch(value)}
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
              onValueChange={(value) => setSelectedYear(value)}
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

      {/* Review Timetable UI */}
      {isSelectionValid && (
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Format Review: {selectedBatch} - {selectedYear}
            </CardTitle>
            <Button
              onClick={saveReviewTimetable}
              className="px-4 py-2 rounded-md text-sm"
            >
              Save Review
            </Button>
          </CardHeader>

          <CardContent>
            <p className="mb-6 italic text-sm">
              Select a lecturer who is unavailable for that time slot.
            </p>
            <div className="grid grid-cols-8 gap-2 text-xs font-semibold border-b pb-2 text-center">
              {timeSlots.map((slot, idx) => (
                <div key={idx}>{slot}</div>
              ))}
            </div>

            {Object.keys(reviewTimetable).map((day) => (
              <div key={day}>
                <h3 className="mt-6 mb-2 font-medium text-sm">{day}</h3>
                <div className="grid grid-cols-8 gap-2">
                  {reviewTimetable[day].map((slot, idx) => {
                   
                    const textColor =
                      slot.type === 'lab'
                        ? 'text-yellow-400'
                        : slot.type === 'class'
                        ? 'text-green-400'
                        : 'text-gray-300';

                    return (
                      <div
                        key={idx}
                        className={`border rounded-md p-2 text-xs items-center space-y-1 shadow-sm`}
                      >
                        {/* Slot Type Display with colored text */}
                        <p className={`text-xs italic ${textColor}`}>
                          Slot Type: {slot.type ?? 'N/A'}
                        </p>

                        {/* Unavailable Lecturer Dropdown */}
                        <Select
                          value={slot.unavailableLecturer || ''}
                          onValueChange={(val) =>
                            updateSlotUnavailableLecturer(day, idx, val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="select" />
                          </SelectTrigger>
                          <SelectContent>
                            {lecturers.map((lec) => (
                              <SelectItem key={lec} value={lec}>
                                {lec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
