"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subject {
  subjectCode: string;
  subjectName: string;
  type: "core" | "elective" | "lab" | "project";
  assigned: boolean;
}

const subjects: Subject[] = [
  { subjectCode: "CS101", subjectName: "Intro to CS", type: "core", assigned: true },
  { subjectCode: "CS201", subjectName: "Data Structures", type: "core", assigned: false },
];

// Filter only assigned subjects
const assignedSubjects = subjects.filter((s) => s.assigned);

const getTypeColor = (type: Subject["type"]): string => {
  switch (type) {
    case "core":
      return "bg-blue-100 text-blue-800";
    case "elective":
      return "bg-green-100 text-green-800";
    case "lab":
      return "bg-purple-100 text-purple-800";
    case "project":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeLabel = (type: Subject["type"]): string => {
  switch (type) {
    case "core":
      return "Core";
    case "elective":
      return "Elective";
    case "lab":
      return "Lab";
    case "project":
      return "Project";
    default:
      return "Unknown";
  }
};

export default function FacultyViewSubjectsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {assignedSubjects.length > 0 ? "Assigned Subjects" : "No Subjects Assigned"}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {assignedSubjects.map((subject) => (
          <div key={subject.subjectCode}>
            <span className="inline-block mb-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Assigned</span>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-lg flex flex-col">
                  <span>{subject.subjectName}</span>
                </CardTitle>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeColor(subject.type)}`}>
                  {getTypeLabel(subject.type)}
                </span>
              </CardHeader>
              <CardContent>
                <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200">
                  {subject.subjectCode}
                </span>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
