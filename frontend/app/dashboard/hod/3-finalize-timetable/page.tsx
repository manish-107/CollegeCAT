"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface TimetableSummary {
  totalSlots: number;
  filledSlots: number;
  conflicts: number;
  facultyWorkload: {
    faculty: string;
    subjects: number;
    hours: number;
  }[];
}

const timetableSummary: TimetableSummary = {
  totalSlots: 25,
  filledSlots: 18,
  conflicts: 0,
  facultyWorkload: [
    { faculty: "Dr. Smith", subjects: 3, hours: 6 },
    { faculty: "Dr. Johnson", subjects: 2, hours: 4 },
    { faculty: "Prof. Patel", subjects: 2, hours: 4 },
    { faculty: "Dr. Kumar", subjects: 1, hours: 2 },
  ],
};

const conflicts = [
  // No conflicts in this example
];

const recommendations = [
  "All faculty workloads are balanced",
  "No scheduling conflicts detected",
  "Room assignments are optimal",
  "Subject distribution is appropriate",
];

// Dummy timetable data for display
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
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timetable = {
  Monday: [
    { type: 'class', subject: 'Math' },
    { type: 'class', subject: 'AI' },
    { type: 'lab', subject: 'OS Lab' },
    { type: 'lab', subject: 'OS Lab' },
    { type: 'lab', subject: 'OS Lab' },
    { type: 'class', subject: 'Cloud' },
    { type: 'class', subject: 'ML' },
    { type: 'class', subject: 'Networks' },
  ],
  Tuesday: [
    { type: 'class', subject: 'DSA' },
    { type: 'class', subject: 'Math' },
    { type: 'class', subject: 'AI' },
    { type: 'class', subject: 'Cloud' },
    { type: 'class', subject: 'ML' },
    { type: 'class', subject: 'Networks' },
    { type: 'class', subject: 'Elective' },
    { type: 'class', subject: 'DSA' },
  ],
  Wednesday: [
    { type: 'class', subject: 'Math' },
    { type: 'lab', subject: 'DB Lab' },
    { type: 'lab', subject: 'DB Lab' },
    { type: 'lab', subject: 'DB Lab' },
    { type: 'class', subject: 'AI' },
    { type: 'class', subject: 'Cloud' },
    { type: 'class', subject: 'ML' },
    { type: 'class', subject: 'Networks' },
  ],
  Thursday: [
    { type: 'class', subject: 'Elective' },
    { type: 'class', subject: 'Math' },
    { type: 'class', subject: 'AI' },
    { type: 'class', subject: 'Cloud' },
    { type: 'class', subject: 'ML' },
    { type: 'class', subject: 'Networks' },
    { type: 'class', subject: 'Elective' },
    { type: 'class', subject: 'DSA' },
  ],
  Friday: [
    { type: 'class', subject: 'Math' },
    { type: 'class', subject: 'AI' },
    { type: 'class', subject: 'Cloud' },
    { type: 'class', subject: 'ML' },
    { type: 'class', subject: 'Networks' },
    { type: 'class', subject: 'Elective' },
    { type: 'class', subject: 'DSA' },
    { type: 'class', subject: 'Math' },
  ],
};

export default function HODFinalizeTimetablePage() {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  const handleFinalize = () => {
    setIsFinalizing(true);
    // Simulate API call
    setTimeout(() => {
      setIsFinalizing(false);
      setIsFinalized(true);
    }, 2000);
  };

  const completionPercentage = (timetableSummary.filledSlots / timetableSummary.totalSlots) * 100;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Finalize Timetable</h2>
        <p className="text-muted-foreground">Review and confirm the final timetable</p>
      </div>

      {!isFinalized ? (
        <>
          

        

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>System Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Final Timetable */}
          <Card>
            <CardHeader>
              <CardTitle>Final Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2 text-xs font-semibold border-b pb-2 text-center">
                {timeSlots.map((slot, idx) => (
                  <div key={idx}>{slot}</div>
                ))}
              </div>
              {days.map((day) => (
                <div key={day}>
                  <h3 className="mt-6 mb-2 font-medium text-sm">{day}</h3>
                  <div className="grid grid-cols-8 gap-2">
                    {(() => {
                      const slots = timetable[day as keyof typeof timetable];
                      const cells = [];
                      for (let idx = 0; idx < slots.length; ) {
                        const slot = slots[idx];
                        // Lab block logic
                        const isLabStart =
                          slot.type === 'lab' &&
                          idx <= slots.length - 3 &&
                          slots[idx + 1]?.type === 'lab' &&
                          slots[idx + 2]?.type === 'lab';
                        if (isLabStart) {
                          cells.push(
                            <div
                              key={idx}
                              className="col-span-3 border-input dark:bg-input/30 dark:hover:bg-input/50 text-center gap-2 rounded-md border bg-yellow px-2 py-2"
                            >
                              <p className="text-xs italic text-yellow-700">LAB</p>
                              {slot.subject && <p className="text-sm">{slot.subject}</p>}
                            </div>
                          );
                          idx += 3;
                        } else {
                          const textColor =
                            slot.type === 'lab'
                              ? 'text-yellow-700'
                              : slot.type === 'class'
                                ? 'text-green-700'
                                : 'text-gray-600';
                          cells.push(
                            <div
                              key={idx}
                              className="border-input dark:bg-input/30 dark:hover:bg-input/50 text-center gap-2 rounded-md border bg-transparent px-2 py-2"
                            >
                              <p className={`text-xs italic ${textColor}`}>{slot.type.toUpperCase()}</p>
                              {slot.subject && <p className="text-sm">{slot.subject}</p>}
                            </div>
                          );
                          idx++;
                        }
                      }
                      return cells;
                    })()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Finalize Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="px-8"
            >
              {isFinalizing ? "Finalizing..." : "Finalize Timetable"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This action will make the timetable final and visible to all faculty members.
            </p>
          </div>
        </>
      ) : (
        <Card className="text-center">
          <CardContent className="p-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Timetable Finalized!</h3>
            <p className="text-muted-foreground">
              The timetable has been successfully finalized and is now visible to all faculty members.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 