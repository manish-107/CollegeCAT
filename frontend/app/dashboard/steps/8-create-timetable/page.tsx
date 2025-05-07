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
  
    if (currentValue === null) {
      // Set current only to 'class'
      updatedTimetable[day][periodIndex] = 'class';
    } else if (currentValue === 'class') {
      // Set current and next two to 'lab'
      for (let i = 0; i < 3; i++) {
        if (periodIndex + i < 8) {
          updatedTimetable[day][periodIndex + i] = 'lab';
        }
      }
    } else {
      // Reset current and next two to null
      for (let i = 0; i < 3; i++) {
        if (periodIndex + i < 8) {
          updatedTimetable[day][periodIndex + i] = null;
        }
      }
    }
  
    setTimetable(updatedTimetable);
  };
  


  const renderTimetable = () => {
    return Object.keys(timetable).map((day) => (
      <div key={day} className="timetable-day ">
        <h3 className="text-l font-bold mb-2 border-t pt-2 text-center ">{day}</h3>
        <div className="grid grid-cols-8 gap-2 border-t pt-2">
          {timeSlots.map((time, periodIndex) => (
            <div key={periodIndex} className="flex flex-col items-center">
              <div className="text-center text-xs py-2">{time}</div>
              <div
                className={`timetable-period ${timetable[day][periodIndex]} p-2 text-center border rounded-md text-xs cursor-pointer transition-all ${
                  timetable[day][periodIndex] === 'class'
                    ? 'bg-blue-500 text-white'
                    : timetable[day][periodIndex] === 'lab'
                    ? 'bg-green-500 text-white'
                    : ''
                }`}
                onClick={() => handlePeriodChange(day, periodIndex)}
              >
                {timetable[day][periodIndex]
                  ? `${timetable[day][periodIndex]
                      .charAt(0)
                      .toUpperCase() + timetable[day][periodIndex].slice(1)} Period`
                  : `Empty hour`}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
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
