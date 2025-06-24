"use client";

import React from "react";

// Example timetable data
const timetable = [
  {
    day: "Monday",
    slots: [
      { time: "8:00-9:00", subject: "CS101" },
      { time: "9:00-10:00", subject: "-" },
      { time: "10:00-11:00", subject: "CS201" },
      { time: "11:00-12:00", subject: "-" },
      { time: "12:00-1:00", subject: "-" },
    ],
  },
  {
    day: "Tuesday",
    slots: [
      { time: "8:00-9:00", subject: "-" },
      { time: "9:00-10:00", subject: "CS101" },
      { time: "10:00-11:00", subject: "-" },
      { time: "11:00-12:00", subject: "-" },
      { time: "12:00-1:00", subject: "CS201" },
    ],
  },
  {
    day: "Wednesday",
    slots: [
      { time: "8:00-9:00", subject: "-" },
      { time: "9:00-10:00", subject: "-" },
      { time: "10:00-11:00", subject: "-" },
      { time: "11:00-12:00", subject: "CS101" },
      { time: "12:00-1:00", subject: "-" },
    ],
  },
  {
    day: "Thursday",
    slots: [
      { time: "8:00-9:00", subject: "-" },
      { time: "9:00-10:00", subject: "-" },
      { time: "10:00-11:00", subject: "-" },
      { time: "11:00-12:00", subject: "-" },
      { time: "12:00-1:00", subject: "-" },
    ],
  },
  {
    day: "Friday",
    slots: [
      { time: "8:00-9:00", subject: "CS201" },
      { time: "9:00-10:00", subject: "-" },
      { time: "10:00-11:00", subject: "-" },
      { time: "11:00-12:00", subject: "-" },
      { time: "12:00-1:00", subject: "-" },
    ],
  },
];

const timeSlots = [
  "8:00-9:00",
  "9:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-1:00",
];

export default function FacultyViewTimetablePage() {
  const hasTimetable = timetable.some((row) => row.slots.some((slot) => slot.subject !== "-"));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Timetable</h2>
      {!hasTimetable ? (
        <div className="text-center text-muted-foreground">No timetable available yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm bg-card rounded-lg">
            <thead>
              <tr className="bg-muted">
                <th className="border px-4 py-2">Day</th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="border px-4 py-2">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetable.map((row) => (
                <tr key={row.day}>
                  <td className="border px-4 py-2 font-semibold bg-muted/50">{row.day}</td>
                  {row.slots.map((slot, idx) => (
                    <td
                      key={idx}
                      className={`border px-4 py-2 text-center ${slot.subject !== "-" ? "bg-green-50 text-green-800 font-medium" : "text-muted-foreground"}`}
                    >
                      {slot.subject}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 