'use client';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Timetable = {
  [day: string]: Array<string | null>; // Stores 'class', 'lab', or null for each period of a day
};

const TimetableFormatPage = () => {
  // Define the timetable with 8 periods for each day
  const [timetable, setTimetable] = useState<Timetable>({
    Monday: Array(8).fill(null),
    Tuesday: Array(8).fill(null),
    Wednesday: Array(8).fill(null),
    Thursday: Array(8).fill(null),
    Friday: Array(8).fill(null),
  });

  // Define the time slots for the periods (you can adjust the times as needed)
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

  const handlePeriodChange = (day: string, periodIndex: number) => {
    const updatedTimetable = { ...timetable };
    const currentValue = updatedTimetable[day][periodIndex];
  
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
      // Find the start of the lab block
      let start = periodIndex;
      // Check if this is the middle or end of a lab block
      if (periodIndex >= 2 &&
          periods[periodIndex - 2] === 'lab' &&
          periods[periodIndex - 1] === 'lab') {
        start = periodIndex - 2;
      } else if (
        periodIndex >= 1 &&
        periodIndex + 1 < 8 &&
        periods[periodIndex - 1] === 'lab' &&
        periods[periodIndex + 1] === 'lab'
      ) {
        start = periodIndex - 1;
      }
  
      // Clear the full 3-period lab block
      for (let i = 0; i < 3; i++) {
        if (start + i < 8) {
          updatedTimetable[day][start + i] = null;
        }
      }
    }
  
    setTimetable(updatedTimetable);
  };
  
  const renderTimetable = () => {
    return (
      <div className="space-y-6">
        {/* Time Header Row */}
        <div className="grid grid-cols-8 gap-2 border-b pb-2">
          {timeSlots.map((time, index) => (
            <div key={index} className="text-center text-xs font-semibold">
              {time}
            </div>
          ))}
        </div>
  
        {/* Days and their periods */}
        {Object.keys(timetable).map((day) => (
          <div key={day} className="timetable-day">
            <h3 className="text-l font-bold mb-2 pt-2">{day}</h3>
            <div className="grid grid-cols-8 gap-2">
              {timetable[day].map((periodValue, periodIndex) => (
                <div
                  key={periodIndex}
                  className={`timetable-period ${periodValue} p-2 text-center border rounded-md text-xs cursor-pointer transition-all ${
                    periodValue === 'class'
                      ? 'bg-blue-500 text-white'
                      : periodValue === 'lab'
                      ? 'bg-green-500 text-white'
                      : ''
                  }`}
                  onClick={() => handlePeriodChange(day, periodIndex)}
                >
                  {periodValue
                    ? `${periodValue.charAt(0).toUpperCase() + periodValue.slice(1)} Period`
                    : `Empty hour`}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  

  const saveTimetable = () => {
    // Here you would save the timetable to the database or wherever it's stored
    console.log('Timetable saved', timetable);
    alert('Timetable saved successfully!');
  };

  return (
    <div className="p-6  mx-20 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Set Timetable Format</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 italic text-sm">
            Click on the periods to toggle between classes and labs.
          </p>
          <div className="space-y-4">{renderTimetable()}</div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={saveTimetable}
          className="mt-6 px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
        >
          Save Timetable Format
        </Button>
      </div>
    </div>
  );
};

export default TimetableFormatPage;
