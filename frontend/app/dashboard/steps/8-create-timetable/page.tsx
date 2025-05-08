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

type Timetable = {
  [day: string]: Array<string | null>;
};

export default function HodTimetablePage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const isSelectionValid = selectedBatch && selectedYear;

  const [timetable, setTimetable] = useState<Timetable>({
    Monday: Array(8).fill(null),
    Tuesday: Array(8).fill(null),
    Wednesday: Array(8).fill(null),
    Thursday: Array(8).fill(null),
    Friday: Array(8).fill(null),
  });

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

  const countLabBlocks = (periods: Array<string | null>) => {
    let count = 0;
    for (let i = 0; i < periods.length - 2; i++) {
      if (
        periods[i] === 'lab' &&
        periods[i + 1] === 'lab' &&
        periods[i + 2] === 'lab'
      ) {
        count++;
        i += 2;
      }
    }
    return count;
  };

  const handlePeriodChange = (day: string, periodIndex: number) => {
    const updatedTimetable = { ...timetable };
    const currentValue = updatedTimetable[day][periodIndex];

    const totalLabBlocks = Object.values(updatedTimetable)
      .map((dayPeriods) => countLabBlocks(dayPeriods))
      .reduce((sum, count) => sum + count, 0);

    const dayLabBlocks = countLabBlocks(updatedTimetable[day]);
    const periods = updatedTimetable[day];

    if (currentValue === null) {
      updatedTimetable[day][periodIndex] = 'class';
    } else if (currentValue === 'class') {
      if (
        periodIndex + 2 < 8 &&
        dayLabBlocks === 0 &&
        totalLabBlocks < 3
      ) {
        for (let i = 0; i < 3; i++) {
          updatedTimetable[day][periodIndex + i] = 'lab';
        }
      } else {
        updatedTimetable[day][periodIndex] = null;
      }
    } else if (currentValue === 'lab') {
      let start = periodIndex;
      if (
        periodIndex >= 2 &&
        periods[periodIndex - 1] === 'lab' &&
        periods[periodIndex - 2] === 'lab'
      ) {
        start = periodIndex - 2;
      } else if (
        periodIndex >= 1 &&
        periodIndex + 1 < 8 &&
        periods[periodIndex - 1] === 'lab' &&
        periods[periodIndex + 1] === 'lab'
      ) {
        start = periodIndex - 1;
      }

      for (let i = 0; i < 3; i++) {
        if (start + i < 8) {
          updatedTimetable[day][start + i] = null;
        }
      }
    }

    setTimetable(updatedTimetable);
  };


  const saveTimetable = () => {
    console.log('Timetable saved', timetable);
    alert('Timetable saved successfully!');
  };


  const renderTimetable = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-8 gap-2 border-b pb-2 text-center text-xs font-semibold">
        {timeSlots.map((slot, idx) => (
          <div key={idx}>{slot}</div>
        ))}
      </div>
      {Object.keys(timetable).map((day) => (
        <div key={day}>
          <h3 className="text-sm font-semibold mt-4 mb-2">{day}</h3>
          <div className="grid grid-cols-8 gap-2">
            {timetable[day].map((val, idx) => (
              <div
                key={idx}
                className={`text-xs text-center border p-2 rounded-md cursor-pointer transition-all ${val === 'class'
                  ? 'bg-blue-600 text-white border-blue-700 shadow'
                  : val === 'lab'
                    ? 'bg-green-600 text-white border-green-700 shadow-md'
                    : ''
                  }`}
                onClick={() => handlePeriodChange(day, idx)}
              >
                {val ? `${val.charAt(0).toUpperCase() + val.slice(1)} hour` : 'Empty hour'}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Batch & Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Set Timetable Format</CardTitle>
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

      {/* Timetable UI */}
      {isSelectionValid && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg">
              Timetable for {selectedBatch} - {selectedYear}
            </CardTitle>
            <Button
              onClick={saveTimetable}
              className="px-2 py-2 rounded-md  transition-all text-sm"
            >
              Save Timetable Format
            </Button>
          </CardHeader>

          <CardContent>

            <p className="mb-8 italic text-sm">
              Click on the periods to toggle between classes and labs.
            </p>
            <div className="space-y-2">{renderTimetable()}</div>
          </CardContent>
        </Card>


      )}
    </div>
  );
}
